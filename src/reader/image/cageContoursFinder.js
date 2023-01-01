import cv from '@techstark/opencv-js';
import Jimp from 'jimp';
import _ from 'lodash';
import { Rect } from './rect';

const CAGE_BOUNDARY_DOT_MAX_SIZE = 15;
const CANNY_THRESHOLD_MIN = 20;
const CANNY_THRESHOLD_MAX = 100;
const TMP_CAGE_CONTOURS_DUMP_PATH = './tmp/cageContours.png';
const TMP_CAGE_CONTOUR_COLOR = new cv.Scalar(0, 255, 0);
const TMP_CAGE_CONTOUR_THICKNESS = 2;

export async function findCageContours(imagePath) {
    // read image using Jimp.
    const jimpSrc = await Jimp.read(imagePath);

    // convert image to OpenCV Mat and prepare source
    const src = cv.matFromImageData(jimpSrc.bitmap);
    prepareSourceMat(src);

    // find cage contours and dump results
    const contoursMatVector = new cv.MatVector();
    const allCageContours = findAllCageContours(src, contoursMatVector);
    dumpTmpCageContoursOutput(src, allCageContours, TMP_CAGE_CONTOURS_DUMP_PATH);

    // find grid contour
    const gridContour = findGridContourFromCageContours(allCageContours, src.rows, src.cols);
    console.log(`Grid contour: (${gridContour.x} + ${gridContour.x + gridContour.width}, (${gridContour.y} + ${gridContour.y + gridContour.height})`);
    console.log(`Total size: ${src.rows} x ${src.cols}`);

    // cleanup
    contoursMatVector.delete();
    src.delete();

    return allCageContours;
}

function prepareSourceMat(src) {
    // convert to grayscale
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

    // run canny edge detector
    cv.Canny(src, src, CANNY_THRESHOLD_MIN, CANNY_THRESHOLD_MAX);
}

function findAllCageContours(src, contoursMatVector) {
    cv.findContours(src, contoursMatVector, new cv.Mat(), cv.RETR_TREE, cv.CHAIN_APPROX_NONE);

    const allCageContours = [];
    const contoursBoundingRectsSet = new Set();
    _.range(contoursMatVector.size()).forEach(i => {
        const contour = contoursMatVector.get(i);
        const cvRect = Rect.from(cv.boundingRect(contour));

        if (cvRect.width < CAGE_BOUNDARY_DOT_MAX_SIZE && cvRect.height < CAGE_BOUNDARY_DOT_MAX_SIZE) {
            const key = `(${cvRect.x} + ${cvRect.width}, ${cvRect.y} + ${cvRect.height})`;
            if (!contoursBoundingRectsSet.has(key)) {
                contoursBoundingRectsSet.add(key);
                allCageContours.push(contour);
            }
        }
    });

    return allCageContours;
}

function findGridContourFromCageContours(allCageContours, totalWidth, totalHeight) {
    const leftXMap = new Map();
    const rightXMap = new Map();
    const topYMap = new Map();
    const bottomYMap = new Map();

    for (const cageContour of allCageContours) {
        const cvRect = cv.boundingRect(cageContour);
        accumCoordEntry(leftXMap, cvRect.x);
        accumCoordEntry(rightXMap, cvRect.x + cvRect.width);
        accumCoordEntry(topYMap, cvRect.y);
        accumCoordEntry(bottomYMap, cvRect.y + cvRect.height);
    }

    const minX = findFirstSignificantCoord(leftXMap);
    const maxX = findFirstSignificantCoord(rightXMap, true);
    const minY = findFirstSignificantCoord(topYMap);
    const maxY = findFirstSignificantCoord(bottomYMap, true);

    return new Rect(minX, minY, maxX - minX, maxY - minY);
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

function dumpTmpCageContoursOutput(src, cageContours, outputPath) {
    const mat = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

    for (const cageContour of cageContours) {
        const cvRect = cv.boundingRect(cageContour);
        const topLeft = new cv.Point(cvRect.x, cvRect.y);
        const bottomRight = new cv.Point(cvRect.x + cvRect.width, cvRect.y + cvRect.height);
        cv.rectangle(mat, topLeft, bottomRight, TMP_CAGE_CONTOUR_COLOR, TMP_CAGE_CONTOUR_THICKNESS);
    }

    new Jimp({
        width: mat.cols,
        height: mat.rows,
        data: Buffer.from(mat.data)
    }).write(outputPath);

    mat.delete();
}
