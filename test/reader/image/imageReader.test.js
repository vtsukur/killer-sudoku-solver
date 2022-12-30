import Jimp from 'jimp';
import cv from '@techstark/opencv-js';
import _ from 'lodash';
import tesseract from 'node-tesseract-ocr'; // use native port instead

async function recognizeText(img) {
    await tesseract.recognize('./out/text0.png', {
        lang: "eng",
        oem: 1,
        psm: 6,
    }).then((text) => {
        console.log(text)
    });
}

async function loadImage() {
    var jimpSrc = await Jimp.read('./test/reader/image/samples/dailyKillerSudokuDotCom_24919.png');
    var src = cv.matFromImageData(jimpSrc.bitmap);

    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(src, src, 50, 200, 3);

    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    let contours = new cv.MatVector();
    let h = new cv.Mat();
    cv.findContours(src, contours, h, cv.RETR_TREE, cv.CHAIN_APPROX_NONE);
    let color = new cv.Scalar(0, 255, 0);
    // cv.drawContours(dst, contours, -1, color, 2);
    
    const dotContours = [];
    const textContours = [];
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
        if (_.inRange(boundingRect.width, 10, 40) && _.inRange(boundingRect.height, 10, 40)) {
            const topLeftPoint = new cv.Point(boundingRect.x, boundingRect.y);
            const bottomRightPoint = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
            cv.rectangle(dst, topLeftPoint, bottomRightPoint, color, 2);
            textContours.push(contour);
        }
    });

    new Jimp({
        width: dst.cols,
        height: dst.rows,
        data: Buffer.from(dst.data)
    }).write('./out/output.png');

    _.range(textContours.length).forEach(i => {
        const tCBR = cv.boundingRect(textContours[i]);
        const srcCpy = new Jimp(jimpSrc);
        srcCpy.crop(tCBR.x, tCBR.y, tCBR.width, tCBR.height).write(`./out/text${i}.png`);
    });
    // new Jimp({
    //     width: textContours[0].cols,
    //     height: textContours[0].rows,
    //     data: Buffer.from(textContours[0].data)
    // }).write('text0.png');

    src.delete();
    dst.delete();

    return {
        dotContours,
        textContours
    }
}

describe('Image reader tests', () => {
    test('Read problem from image', async () => {
        const contours = await loadImage();
        await recognizeText(contours.textContours[0]);
    });
});
