import cv from '@techstark/opencv-js';
import Jimp from 'jimp';
import _ from 'lodash';
import tesseract from 'node-tesseract-ocr'; // use native port instead
import { createWorker } from 'tesseract.js';
import { Cage } from '../puzzle/cage';
import { Cell } from '../puzzle/cell';
import { Grid } from '../puzzle/grid';
import { House } from '../puzzle/house';
import { Puzzle } from '../puzzle/puzzle';
import { logFactory } from '../util/logFactory';
import { TempFilePaths } from '../util/tempFilePaths';
import { CageContour } from './cageContour';
import { CellContour } from './cellContour';
import { GridContour } from './gridContour';
import { Rect } from './rect';

const CAGE_BOUNDARY_DOT_MAX_SIZE = 15;
const CANNY_THRESHOLD_MIN = 20;
const CANNY_THRESHOLD_MAX = 100;
const GRID_CONTOUR_ADJUSTMENT = 3;
const TMP_CAGE_CONTOUR_COLOR = new cv.Scalar(0, 255, 0);
const TMP_CELL_CONTOUR_COLOR = new cv.Scalar(255, 0, 0);
const TMP_CONTOUR_THICKNESS = 2;

const log = logFactory.withLabel('Puzzle Recognition via Computer Vision');

export async function recognize(imagePath, taskId) {
    const paths = new Paths(taskId).recreateBaseDirSync();

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
    await dumpTmpContoursOutput(src, dottedCageContours, cellContoursMatrix, paths.puzzleImageSignificantContoursFilePath);

    // cleanup
    contoursMatVector.delete();
    src.delete();

    // determine cage contours
    const cageContours = determineCageContoursByCells(cellContoursMatrix);
    log.info(`Computed cage contours. Total cages: ${cageContours.length}`);

    log.info(`Preparing for detection of sums for each cage with extra image processing. Cage contours count: ${cageContours.length}`);
    const tesseractWorker = await createWorker();
    await tesseractWorker.loadLanguage('eng');
    await tesseractWorker.initialize('eng');
    tesseractWorker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_ocr_engine_mode: 0,
        tessedit_pageseg_mode: 6
    });
    const cages = await prepareCageSumImages(cageContours, jimpSrc, paths, tesseractWorker);
    await tesseractWorker.terminate();

    const puzzle = new Puzzle(cages);

    return {
        puzzle,
        paths
    };
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

async function prepareCageSumImages(cageContours, srcImage, tempFilePaths, tesseractWorker) {
    const cages = [];

    let idx = 0;
    for (const cageContour of cageContours) {
        idx++;
        log.info(`Image processing of text area for cage contour ${idx}. Cells: ${cageContour.cells}`);

        await simplifiedCageSumImageReader(cageContour, idx, srcImage, tempFilePaths);
        let sum = await ocr(cageContour.sumImagePath, tesseractWorker);

        if (isNaN(sum)) {
            log.info('Simple sum text detection failed. Trying diligent OpenCV-based image post processor');
            await diligentOpenCVPostProcessingCageSumImageReader(cageContour, idx, srcImage, tempFilePaths);
            sum = await ocr(cageContour.sumImagePath, tesseractWorker);
        }

        const cageBuilder = Cage.ofSum(sum);
        cageContour.cells.forEach(cell => cageBuilder.cell(cell));
        cages.push(cageBuilder.mk());
    }

    return cages;
}

async function ocr(sumImagePath, tesseractWorker) {
    const { data: { text } } = await tesseractWorker.recognize(sumImagePath, 'eng');
    log.info(`Detected sum text for cage via OCR: ${text.trim()}`);
    return parseInt(text);
    // return await tesseract.recognize(sumImagePath, {
    //     lang: 'eng',
    //     oem: 1,
    //     psm: 6,
    // }).then((text) => {
    //     log.info(`Detected sum text for cage via OCR: ${text.trim()}`);
    //     return parseInt(text);
    // });
}

async function simplifiedCageSumImageReader(cageContour, idx, srcImage, tempFilePaths) {
    const sumAreaRect = cageContour.topLeftCellContour.computeSumAreaRect();

    const scaledSum = new Jimp(srcImage).crop(sumAreaRect.x, sumAreaRect.y, sumAreaRect.width, sumAreaRect.height);
    const scaledWidth = sumAreaRect.width * 2;
    const scaledHeight = sumAreaRect.height * 2;
    const scaledSumWithExtraWhiteSpace = new Jimp(scaledWidth, scaledHeight, 0xffffffff).composite(scaledSum, sumAreaRect.width * 0.5, sumAreaRect.height * 0.5);

    const cageSumTextFilePath = tempFilePaths.cageSumTextFilePath(idx, 'simple_padded');
    await scaledSumWithExtraWhiteSpace.writeAsync(cageSumTextFilePath);

    cageContour.sumImagePath = cageSumTextFilePath;
}

async function diligentOpenCVPostProcessingCageSumImageReader(cageContour, idx, srcImage, tempFilePaths) {
    const topLeftCellContourRect = cageContour.topLeftCellContour.rect;

    const leftX = topLeftCellContourRect.x + 3;
    const width = topLeftCellContourRect.width * 0.35;
    const topY = topLeftCellContourRect.y + 3;
    const height = topLeftCellContourRect.height * 0.33;

    const scaledSum = new Jimp(srcImage).crop(leftX, topY, width, height).scale(3);
    const scaledWidth = width * 6;
    const scaledHeight = height * 6;
    const scaledSumWithExtraWhiteSpace = new Jimp(scaledWidth, scaledHeight, 0xffffffff).composite(scaledSum, width * 1.5, height * 1.5);
    await scaledSumWithExtraWhiteSpace.writeAsync(tempFilePaths.cageSumTextFilePath(idx, 'diligent_scaled-padded'));

    // convert image to OpenCV Mat and prepare source
    const src = cv.matFromImageData(scaledSumWithExtraWhiteSpace.bitmap);
    prepareSourceMat(src);
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
    cv.dilate(src, src, kernel);

    const dilatedData = new Uint8Array(src.cols * src.rows * 3);
    _.range(src.cols * src.rows).forEach(i => {
        const offset = i * 3;
        dilatedData[offset] = src.data[i];
        dilatedData[offset + 1] = src.data[i];
        dilatedData[offset + 2] = src.data[i];
    });
    await new Jimp({
        width: src.cols,
        height: src.rows,
        data: Buffer.from(dilatedData)
    }).writeAsync(tempFilePaths.cageSumTextFilePath(idx, 'diligent_scaled-padded_dilated'));

    // find cage contours
    const contoursMatVector = new cv.MatVector();
    cv.findContours(src, contoursMatVector, new cv.Mat(), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const allContoursMat = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    const textContoursMat = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

    let maxContourRect = undefined;
    const potentialTextContourRects = [];
    _.range(contoursMatVector.size()).forEach(i => {
        const contour = contoursMatVector.get(i);
        const cvRect = cv.boundingRect(contour);
        const topLeft = new cv.Point(cvRect.x, cvRect.y);
        const bottomRight = new cv.Point(cvRect.x + cvRect.width, cvRect.y + cvRect.height);
        cv.rectangle(allContoursMat, topLeft, bottomRight, TMP_CAGE_CONTOUR_COLOR, TMP_CONTOUR_THICKNESS);

        if (cvRect.width > 15 && cvRect.height > 15) {
            potentialTextContourRects.push(cvRect);
            if (_.isUndefined(maxContourRect)) {
                maxContourRect = cvRect;
            } else if (cvRect.width * cvRect.height > maxContourRect.width * maxContourRect.height) {
                maxContourRect = cvRect;
            }
        }
    });

    const maxContourRectSize = maxContourRect.width * maxContourRect.height;
    const textContourRects = [];
    let masterRectLeftX = scaledWidth;
    let masterRectRightX = 0;
    let masterRectTopY = scaledHeight;
    let masterRectBottomY = 0;
    for (const potentialTextContourRect of potentialTextContourRects) {
        if ((potentialTextContourRect.width * potentialTextContourRect.height) / maxContourRectSize > 0.3) {
            textContourRects.push(potentialTextContourRect);

            const topLeft = new cv.Point(potentialTextContourRect.x, potentialTextContourRect.y);
            const bottomRight = new cv.Point(potentialTextContourRect.x + potentialTextContourRect.width, potentialTextContourRect.y + potentialTextContourRect.height);
            cv.rectangle(textContoursMat, topLeft, bottomRight, TMP_CAGE_CONTOUR_COLOR, TMP_CONTOUR_THICKNESS);

            masterRectLeftX = Math.min(masterRectLeftX, topLeft.x);
            masterRectTopY = Math.min(masterRectTopY, topLeft.y);
            masterRectRightX = Math.max(masterRectRightX, bottomRight.x);
            masterRectBottomY = Math.max(masterRectBottomY, bottomRight.y);
        }
    }
    masterRectLeftX -= 2;
    masterRectRightX += 2;
    masterRectTopY -= 2;
    masterRectBottomY += 2;
    const adjustedMasterRect = new Rect(masterRectLeftX, masterRectTopY, masterRectRightX - masterRectLeftX, masterRectBottomY - masterRectTopY);

    await new Jimp({
        width: allContoursMat.cols,
        height: allContoursMat.rows,
        data: Buffer.from(allContoursMat.data)
    }).writeAsync(tempFilePaths.cageSumTextFilePath(idx, 'diligent_scaled-padded_all-contours'));
    await new Jimp({
        width: textContoursMat.cols,
        height: textContoursMat.rows,
        data: Buffer.from(textContoursMat.data)
    }).writeAsync(tempFilePaths.cageSumTextFilePath(idx, 'diligent-scaled-padded_char-contours'));

    const cleanSumImage = new Jimp(scaledSumWithExtraWhiteSpace).crop(
        adjustedMasterRect.x, adjustedMasterRect.y,
        adjustedMasterRect.width, adjustedMasterRect.height);
    const finalPath = tempFilePaths.cageSumTextFilePath(idx, 'diligent_final');
    await new Jimp(adjustedMasterRect.width * 3, adjustedMasterRect.height * 3, 0xffffffff).
        composite(cleanSumImage, adjustedMasterRect.width, adjustedMasterRect.height).writeAsync(finalPath);

    src.delete();
    contoursMatVector.delete();

    cageContour.sumImagePath = finalPath;
}

async function dumpTmpContoursOutput(src, dottedCageContours, cellContoursMatrix, outputPath) {
    if (!log.isDebug) return;

    log.debug('Writing dotted cage contours and cell contours file');
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

    await new Jimp({
        width: mat.cols,
        height: mat.rows,
        data: Buffer.from(mat.data)
    }).writeAsync(outputPath);

    mat.delete();
}

class Paths extends TempFilePaths {
    constructor(taskId) {
        super(`./tmp/puzzle-recognizer/${taskId}`);
    }

    get puzzleImageSignificantContoursFilePath() {
        return this.filePath('puzzle-image-significant-contours.png');
    }

    cageSumTextFilePath(id, classifier) {
        return this.filePath(`${id}/cage-sum_${classifier}.png`);
    }
}
