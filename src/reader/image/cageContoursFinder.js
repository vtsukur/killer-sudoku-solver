import cv from '@techstark/opencv-js';
import Jimp from 'jimp';
import _ from 'lodash';
import tesseract from 'node-tesseract-ocr'; // use native port instead
import * as fs from 'node:fs';
import { Cage } from '../../problem/cage';
import { Cell } from '../../problem/cell';
import { Grid } from '../../problem/grid';
import { House } from '../../problem/house';
import { Problem } from '../../problem/problem';
import { logFactory } from '../../util/logFactory';
import { CageContour } from './cageContour';
import { CellContour } from './cellContour';
import { GridContour } from './gridContour';
import { Rect } from './rect';

const CAGE_BOUNDARY_DOT_MAX_SIZE = 15;
const CANNY_THRESHOLD_MIN = 20;
const CANNY_THRESHOLD_MAX = 100;
const GRID_CONTOUR_ADJUSTMENT = 3;
const TMP_DIR_PATH = './tmp/cv'
const TMP_CAGE_CONTOURS_DUMP_PATH = `${TMP_DIR_PATH}/contours.png`;
const TMP_CAGE_CONTOUR_COLOR = new cv.Scalar(0, 255, 0);
const TMP_CELL_CONTOUR_COLOR = new cv.Scalar(255, 0, 0);
const TMP_CONTOUR_THICKNESS = 2;

const log = logFactory.of('Puzzle Detection via Computer Vision');

export async function findCageContours(imagePath) {
    fs.rmSync(TMP_DIR_PATH, { recursive: true, force: true });

    // read image using Jimp.
    const jimpSrc = await Jimp.read(imagePath);

    // convert image to OpenCV Mat and prepare source
    const src = cv.matFromImageData(jimpSrc.bitmap);
    log.info(`Analyzing puzzle source image of size ${src.rows} x ${src.cols}`);
    prepareSourceMat(src);

    // find cage contours
    log.info('Detecting dotted cage contours ...');
    const contoursMatVector = new cv.MatVector();
    const dottedCageContours = findDottedCageContours(src, contoursMatVector);
    log.info(`Detected ${dottedCageContours.length} dotted cage contours`);    
    
    // find grid contour
    const gridContour = findGridContour(dottedCageContours);
    log.info(`Detected grid contour: ${gridContour}`);

    // create cell contours and group cage contours by cells
    const cellContoursMatrix = createCellContours(gridContour);
    groupCageContoursByCells(cellContoursMatrix, dottedCageContours, gridContour);
    log.info('Grouped cell contours by cages');

    // dump temporary processing result
    log.info('Writing dotted cage contours and cell contours file');
    dumpTmpContoursOutput(src, dottedCageContours, cellContoursMatrix, TMP_CAGE_CONTOURS_DUMP_PATH);

    // determine cage contours
    const cageContours = determineCageContoursByCells(cellContoursMatrix);
    log.info(`Computed cage contours. Total cages: ${cageContours.length}`);

    log.info(`Preparing for detection of sums for each cage with extra image processing. Cage contours count: ${cageContours.length}`);
    prepareCageSumImages(cageContours, jimpSrc);
    const cages = Array();
    log.info('Running sequential cage sum OCR top left to bottom right');
    for (const cageContour of cageContours) {
        const sum = await tesseract.recognize(cageContour.sumImagePath, {
            lang: 'eng',
            oem: 1,
            psm: 6,
        }).then((text) => {
            return parseInt(text);
        });
        log.info(`Detected sum for cage via OCR: ${sum}`);
        const cageBuilder = Cage.ofSum(sum);
        cageContour.cells.forEach(cell => cageBuilder.cell(cell));
        cages.push(cageBuilder.mk());
    }
    const problem = new Problem(cages);

    // cleanup
    contoursMatVector.delete();
    src.delete();

    return problem;
}

function prepareSourceMat(src) {
    // convert to grayscale
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

    // run canny edge detector
    cv.Canny(src, src, CANNY_THRESHOLD_MIN, CANNY_THRESHOLD_MAX);
}

function findDottedCageContours(src, contoursMatVector) {
    cv.findContours(src, contoursMatVector, new cv.Mat(), cv.RETR_TREE, cv.CHAIN_APPROX_NONE);

    const dottedCageContours = [];
    const contoursBoundingRectsSet = new Set();
    _.range(contoursMatVector.size()).forEach(i => {
        const contour = contoursMatVector.get(i);
        const cvRect = Rect.from(cv.boundingRect(contour));

        if (cvRect.width < CAGE_BOUNDARY_DOT_MAX_SIZE && cvRect.height < CAGE_BOUNDARY_DOT_MAX_SIZE) {
            const key = `(${cvRect.x} + ${cvRect.width}, ${cvRect.y} + ${cvRect.height})`;
            if (!contoursBoundingRectsSet.has(key)) {
                contoursBoundingRectsSet.add(key);
                dottedCageContours.push(contour);
            }
        }
    });

    return dottedCageContours;
}

function findGridContour(dottedCageContours) {
    const leftXMap = new Map();
    const rightXMap = new Map();
    const topYMap = new Map();
    const bottomYMap = new Map();

    for (const dottedCageContour of dottedCageContours) {
        const cvRect = cv.boundingRect(dottedCageContour);
        accumCoordEntry(leftXMap, cvRect.x);
        accumCoordEntry(rightXMap, cvRect.x + cvRect.width);
        accumCoordEntry(topYMap, cvRect.y);
        accumCoordEntry(bottomYMap, cvRect.y + cvRect.height);
    }

    const minX = findFirstSignificantCoord(leftXMap);
    const maxX = findFirstSignificantCoord(rightXMap, true);
    const minY = findFirstSignificantCoord(topYMap);
    const maxY = findFirstSignificantCoord(bottomYMap, true);

    return new GridContour(new Rect(
        minX - GRID_CONTOUR_ADJUSTMENT,
        minY - GRID_CONTOUR_ADJUSTMENT,
        maxX - minX + 2 * GRID_CONTOUR_ADJUSTMENT,
        maxY - minY + 2 * GRID_CONTOUR_ADJUSTMENT
    ));
}

function accumCoordEntry(map, coord) {
    if (map.has(coord)) {
        map.set(coord, map.get(coord) + 1);
    } else {
        map.set(coord, 1);
    }
}

function findFirstSignificantCoord(map, isReverse) {
    const arr = Array.from(map.keys()).sort((a, b) => a - b);
    const isSignificantFn = coord => map.get(coord) > 10;
    const significant = isReverse ? arr.findLast(isSignificantFn) : arr.find(isSignificantFn);

    return significant ? significant : arr[isReverse ? arr.length - 1 : 0];
}

function createCellContours(gridContour) {
    const cellContoursMatrix = Grid.newMatrix();

    _.range(House.SIZE).forEach(row => {
        _.range(House.SIZE).forEach(col => {
            cellContoursMatrix[row][col] = new CellContour(Cell.at(row, col), gridContour.cellRect(row, col));
        });
    });

    return cellContoursMatrix;
}

function groupCageContoursByCells(cellContoursMatrix, dottedCageContours, gridContour) {
    for (const dottedCageContour of dottedCageContours) {
        const cvRect = cv.boundingRect(dottedCageContour);
        const cell = gridContour.cellFromRect(cvRect);
        if (!_.isUndefined(cell)) {
            cellContoursMatrix[cell.row][cell.col].addDottedCageContourRect(cvRect);
            cellContoursMatrix[cell.row][cell.col].markCageContour(cvRect);
        }
    }
}

function determineCageContoursByCells(cellContoursMatrix) {
    const cageContours = [];

    _.range(House.SIZE).forEach(row => {
        _.range(House.SIZE).forEach(col => {
            const cellContour = cellContoursMatrix[row][col];
            if (!cellContour.cageFound) {
                const cageContour = new CageContour();
                cageContours.push(cageContour);
                determineCageContoursByCellsDFS(cellContoursMatrix, row, col, cageContour);
            }
        });
    });

    return cageContours;
}

function determineCageContoursByCellsDFS(cellContoursMatrix, row, col, cageContour) {
    if (!_.inRange(row, 0, House.SIZE) || !_.inRange(col, 0, House.SIZE)) return;

    const cellContour = cellContoursMatrix[row][col];
    if (cellContour.cageFound) return;

    cageContour.addCellContour(cellContour);
    cellContour.setCageFound();

    if (!cellContour.cageBorders.hasAtRight) {
        determineCageContoursByCellsDFS(cellContoursMatrix, row, col + 1, cageContour);
    }
    if (!cellContour.cageBorders.hasAtBottom) {
        determineCageContoursByCellsDFS(cellContoursMatrix, row + 1, col, cageContour);
    }
    if (!cellContour.cageBorders.hasAtLeft) {
        determineCageContoursByCellsDFS(cellContoursMatrix, row, col - 1, cageContour);
    }
    if (!cellContour.cageBorders.hasAtTop) {
        determineCageContoursByCellsDFS(cellContoursMatrix, row - 1, col, cageContour);
    }
}

function prepareCageSumImages(cageContours, srcImage) {
    cageContours.forEach((cageContour, idx) => {
        log.info(`Image processing of text area for cage contour ${idx}. Cells: ${cageContour.cells}`);

        const sumAreaRect = cageContour.topLeftCellContour.computeSumAreaRect();

        const scaledSum = new Jimp(srcImage).crop(sumAreaRect.x, sumAreaRect.y, sumAreaRect.width, sumAreaRect.height).scale(3);
        const scaledWidth = sumAreaRect.width * 6;
        const scaledHeight = sumAreaRect.height * 6;
        const scaledSumWithExtraWhiteSpace = new Jimp(scaledWidth, scaledHeight, 0xffffffff).composite(scaledSum, sumAreaRect.width * 1.5, sumAreaRect.height * 1.5);
        scaledSumWithExtraWhiteSpace.write(`${TMP_DIR_PATH}/sumText_${idx}_raw.png`);

        cageContour.sumImagePath = `${TMP_DIR_PATH}/sumText_${idx}_raw.png`;

        // const topLeftCellContourRect = cageContour.topLeftCellContour.rect;

        // const leftX = topLeftCellContourRect.x + 3;
        // const width = topLeftCellContourRect.width * 0.35;
        // const topY = topLeftCellContourRect.y + 3;
        // const height = topLeftCellContourRect.height * 0.33;

        // const scaledSum = new Jimp(srcImage).crop(leftX, topY, width, height).scale(3);
        // const scaledWidth = width * 6;
        // const scaledHeight = height * 6;
        // const scaledSumWithExtraWhiteSpace = new Jimp(scaledWidth, scaledHeight, 0xffffffff).composite(scaledSum, width * 1.5, height * 1.5);
        // scaledSumWithExtraWhiteSpace.write(`${TMP_DIR_PATH}/sumText_${idx}_raw.png`);

        // // convert image to OpenCV Mat and prepare source
        // const src = cv.matFromImageData(scaledSumWithExtraWhiteSpace.bitmap);
        // prepareSourceMat(src);
        // const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
        // cv.dilate(src, src, kernel);

        // // find cage contours
        // const contoursMatVector = new cv.MatVector();
        // cv.findContours(src, contoursMatVector, new cv.Mat(), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // const allContoursMat = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        // const textContoursMat = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

        // let maxContourRect = undefined;
        // const potentialTextContourRects = Array();
        // _.range(contoursMatVector.size()).forEach(i => {
        //     const contour = contoursMatVector.get(i);
        //     const cvRect = cv.boundingRect(contour);
        //     const topLeft = new cv.Point(cvRect.x, cvRect.y);
        //     const bottomRight = new cv.Point(cvRect.x + cvRect.width, cvRect.y + cvRect.height);
        //     cv.rectangle(allContoursMat, topLeft, bottomRight, TMP_CAGE_CONTOUR_COLOR, TMP_CONTOUR_THICKNESS);

        //     if (cvRect.width > 15 && cvRect.height > 15) {
        //         potentialTextContourRects.push(cvRect);
        //         if (_.isUndefined(maxContourRect)) {
        //             maxContourRect = cvRect;
        //         } else if (cvRect.width * cvRect.height > maxContourRect.width * maxContourRect.height) {
        //             maxContourRect = cvRect;
        //         }
        //     }
        // });

        // const maxContourRectSize = maxContourRect.width * maxContourRect.height;
        // const textContourRects = Array();
        // let masterRectLeftX = scaledWidth;
        // let masterRectRightX = 0;
        // let masterRectTopY = scaledHeight;
        // let masterRectBottomY = 0;
        // for (const potentialTextContourRect of potentialTextContourRects) {
        //     if ((potentialTextContourRect.width * potentialTextContourRect.height) / maxContourRectSize > 0.3) {
        //         textContourRects.push(potentialTextContourRect);

        //         const topLeft = new cv.Point(potentialTextContourRect.x, potentialTextContourRect.y);
        //         const bottomRight = new cv.Point(potentialTextContourRect.x + potentialTextContourRect.width, potentialTextContourRect.y + potentialTextContourRect.height);
        //         cv.rectangle(textContoursMat, topLeft, bottomRight, TMP_CAGE_CONTOUR_COLOR, TMP_CONTOUR_THICKNESS);

        //         masterRectLeftX = Math.min(masterRectLeftX, topLeft.x);
        //         masterRectTopY = Math.min(masterRectTopY, topLeft.y);
        //         masterRectRightX = Math.max(masterRectRightX, bottomRight.x);
        //         masterRectBottomY = Math.max(masterRectBottomY, bottomRight.y);
        //     }
        // }
        // masterRectLeftX -= 2;
        // masterRectRightX += 2;
        // masterRectTopY -= 2;
        // masterRectBottomY += 2;
        // const adjustedMasterRect = new Rect(masterRectLeftX, masterRectTopY, masterRectRightX - masterRectLeftX, masterRectBottomY - masterRectTopY);

        // new Jimp({
        //     width: allContoursMat.cols,
        //     height: allContoursMat.rows,
        //     data: Buffer.from(allContoursMat.data)
        // }).write(`${TMP_DIR_PATH}/sumText_${idx}_all_contours.png`);
        // new Jimp({
        //     width: textContoursMat.cols,
        //     height: textContoursMat.rows,
        //     data: Buffer.from(textContoursMat.data)
        // }).write(`${TMP_DIR_PATH}/sumText_${idx}_text_contours.png`);

        // const cleanSumImage = new Jimp(scaledSumWithExtraWhiteSpace).crop(
        //     adjustedMasterRect.x, adjustedMasterRect.y,
        //     adjustedMasterRect.width, adjustedMasterRect.height);
        // new Jimp(adjustedMasterRect.width * 3, adjustedMasterRect.height * 3, 0xffffffff).
        //     composite(cleanSumImage, adjustedMasterRect.width, adjustedMasterRect.height).write(`${TMP_DIR_PATH}/sumText_${idx}.png`);

        // src.delete();
        // contoursMatVector.delete();

        // cageContour.sumImagePath = `${TMP_DIR_PATH}/sumText_${idx}.png`;
    });
}

function dumpTmpContoursOutput(src, dottedCageContours, cellContoursMatrix, outputPath) {
    const mat = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

    for (const dottedCageContour of dottedCageContours) {
        const cvRect = cv.boundingRect(dottedCageContour);
        const topLeft = new cv.Point(cvRect.x, cvRect.y);
        const bottomRight = new cv.Point(cvRect.x + cvRect.width, cvRect.y + cvRect.height);
        cv.rectangle(mat, topLeft, bottomRight, TMP_CAGE_CONTOUR_COLOR, TMP_CONTOUR_THICKNESS);
    }

    cellContoursMatrix.forEach(cellCRow => {
        cellCRow.forEach(cellC => {
            cv.rectangle(mat,
                new cv.Point(cellC.rect.x, cellC.rect.y),
                new cv.Point(cellC.rect.x + cellC.rect.width, cellC.rect.y + cellC.rect.height),
                TMP_CELL_CONTOUR_COLOR,
                TMP_CONTOUR_THICKNESS);
        });
    });

    new Jimp({
        width: mat.cols,
        height: mat.rows,
        data: Buffer.from(mat.data)
    }).write(outputPath);

    mat.delete();
}
