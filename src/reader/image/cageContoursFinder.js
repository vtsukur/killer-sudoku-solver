import cv from '@techstark/opencv-js';
import Jimp from 'jimp';
import _ from 'lodash';
import { Cell } from '../../problem/cell';
import { Grid } from '../../problem/grid';
import { House } from '../../problem/house';
import { CageContour } from './cageContour';
import { CellContour } from './cellContour';
import { GridContour } from './gridContour';
import { Rect } from './rect';

const CAGE_BOUNDARY_DOT_MAX_SIZE = 15;
const CANNY_THRESHOLD_MIN = 20;
const CANNY_THRESHOLD_MAX = 100;
const GRID_CONTOUR_ADJUSTMENT = 3;
const TMP_CAGE_CONTOURS_DUMP_PATH = './tmp/contours.png';
const TMP_CAGE_CONTOUR_COLOR = new cv.Scalar(0, 255, 0);
const TMP_CELL_CONTOUR_COLOR = new cv.Scalar(255, 0, 0);
const TMP_CONTOUR_THICKNESS = 2;

export async function findCageContours(imagePath) {
    // read image using Jimp.
    const jimpSrc = await Jimp.read(imagePath);

    // convert image to OpenCV Mat and prepare source
    const src = cv.matFromImageData(jimpSrc.bitmap);
    prepareSourceMat(src);

    // find cage contours
    const contoursMatVector = new cv.MatVector();
    const dottedCageContours = findDottedCageContours(src, contoursMatVector);

    // find grid contour
    const gridContour = findGridContour(dottedCageContours);
    console.log(`Grid contour: ${gridContour}`);
    console.log(`Total source image size: ${src.rows} x ${src.cols}`);

    // create cell contours and group cage contours by cells
    const cellContoursMatrix = createCellContours(gridContour);
    groupCageContoursByCells(cellContoursMatrix, dottedCageContours, gridContour);

    // determine cage contours
    const cageContours = determineCageContoursByCells(cellContoursMatrix);

    // dump temporary processing result
    dumpTmpContoursOutput(src, dottedCageContours, cellContoursMatrix, TMP_CAGE_CONTOURS_DUMP_PATH);

    // cleanup
    contoursMatVector.delete();
    src.delete();

    return dottedCageContours;
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
    const cellContour = cellContoursMatrix[row][col];
    if (cellContour.cageFound || !_.inRange(row, 0, House.SIZE) || !_.inRange(col, 0, House.SIZE)) return;

    cageContour.addCell(cellContour.cell);
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
                new cv.Point(cellC.rect.x + cellC.rect.width, cellC.rect.y +  + cellC.rect.height),
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
