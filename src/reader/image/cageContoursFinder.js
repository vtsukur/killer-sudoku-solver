import cv from '@techstark/opencv-js';
import Jimp from 'jimp';
import _ from 'lodash';

export async function findCageContours(imagePath) {
    // read image using Jimp.
    var jimpSrc = await Jimp.read(imagePath);

    // convert image to OpenCV Mat
    var src = cv.matFromImageData(jimpSrc.bitmap);

    // convert to grayscale
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

    // running canny edge detector
    cv.Canny(src, src, 50, 200, 3);

    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    let contours = new cv.MatVector();
    let h = new cv.Mat();
    cv.findContours(src, contours, h, cv.RETR_TREE, cv.CHAIN_APPROX_NONE);
    let color = new cv.Scalar(0, 255, 0);

    const dotContours = [];
    const contoursBRSet = new Set();
    _.range(contours.size()).forEach(i => {
        const contour = contours.get(i);
        const boundingRect = cv.boundingRect(contour);

        const key = `(${boundingRect.x} + ${boundingRect.width}, ${boundingRect.y} + ${boundingRect.height})`;
        if (contoursBRSet.has(key)) return
        contoursBRSet.add(key);
        
        if (boundingRect.width < 15 && boundingRect.height < 15) {
            const topLeftPoint = new cv.Point(boundingRect.x, boundingRect.y);
            const bottomRightPoint = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
            cv.rectangle(dst, topLeftPoint, bottomRightPoint, color, 2);
            dotContours.push(contour);
        }
    });

    new Jimp({
        width: dst.cols,
        height: dst.rows,
        data: Buffer.from(dst.data)
    }).write('./tmp/output.png');

    return dotContours;
}
