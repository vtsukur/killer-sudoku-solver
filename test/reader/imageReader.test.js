import Jimp from 'jimp';
import cv from '@techstark/opencv-js';
import _ from 'lodash';

async function loadImage() {
    var jimpSrc = await Jimp.read('./test/reader/problems/dailyKillerSudokuDotCom_24919.png');
    var src = cv.matFromImageData(jimpSrc.bitmap);

    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(src, src, 50, 200, 3);

    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    let contours = new cv.MatVector();
    let h = new cv.Mat();
    cv.findContours(src, contours, h, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);
    let color = new cv.Scalar(0, 255, 0);
    // cv.drawContours(dst, contours, -1, color, 2);
    
    _.range(contours.size()).forEach(i => {
        const contour = contours.get(i);
        const boundingRect = cv.boundingRect(contour);
        if (boundingRect.width < 15 && boundingRect.height < 15) {
            const topLeftPoint = new cv.Point(boundingRect.x, boundingRect.y);
            const bottomRightPoint = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
            cv.rectangle(dst, topLeftPoint, bottomRightPoint, color, 5);
        }
    });

    new Jimp({
        width: dst.cols,
        height: dst.rows,
        data: Buffer.from(dst.data)
    }).write('output.png');

    src.delete();
    dst.delete();
}

describe('Image reader tests', () => {
    test('Read problem from image', async () => {
        await loadImage();
    });
});
