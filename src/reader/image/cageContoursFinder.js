import cv from '@techstark/opencv-js';
import Jimp from 'jimp';
import _ from 'lodash';

const CAGE_BOUNDARY_DOT_MAX_SIZE = 15;

export async function findCageContours(imagePath) {
    // read image using Jimp.
    const jimpSrc = await Jimp.read(imagePath);

    // convert image to OpenCV Mat and prepare source
    const src = cv.matFromImageData(jimpSrc.bitmap);
    prepareSourceMat(src);

    // find cage contours and dump results
    const allCageContours = findAllCageContours(src);
    dumpTmpCageContoursOutput(src, allCageContours, './tmp/cageContours.png');

    return allCageContours;
}

function prepareSourceMat(src) {
    // convert to grayscale
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

    // run canny edge detector
    cv.Canny(src, src, 50, 200, 3);
}

function findAllCageContours(src) {
    const contours = new cv.MatVector();
    cv.findContours(src, contours, new cv.Mat(), cv.RETR_TREE, cv.CHAIN_APPROX_NONE);

    const allCageContours = [];
    const contoursBoundingRectsSet = new Set();
    _.range(contours.size()).forEach(i => {
        const contour = contours.get(i);
        const boundingRect = cv.boundingRect(contour);

        if (boundingRect.width < CAGE_BOUNDARY_DOT_MAX_SIZE && boundingRect.height < CAGE_BOUNDARY_DOT_MAX_SIZE) {
            const key = `(${boundingRect.x} + ${boundingRect.width}, ${boundingRect.y} + ${boundingRect.height})`;
            if (!contoursBoundingRectsSet.has(key)) {
                contoursBoundingRectsSet.add(key);
                allCageContours.push(contour);
            }
        }
    });

    return allCageContours;
}

function dumpTmpCageContoursOutput(src, cageContours, outputPath) {
    const mat = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    const GREEN = new cv.Scalar(0, 255, 0);
    for (const cageContour of cageContours) {
        const boundingRect = cv.boundingRect(cageContour);
        const topLeft = new cv.Point(boundingRect.x, boundingRect.y);
        const bottomRight = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
        cv.rectangle(mat, topLeft, bottomRight, GREEN, 2);
    }

    new Jimp({
        width: mat.cols,
        height: mat.rows,
        data: Buffer.from(mat.data)
    }).write(outputPath);
}
