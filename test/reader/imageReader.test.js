import Jimp from 'jimp';
import cv from '@techstark/opencv-js';

async function loadImage() {
    var jimpSrc = await Jimp.read('./test/reader/problems/dailyKillerSudokuDotCom_24919.png');
    var src = cv.matFromImageData(jimpSrc.bitmap);

  // following lines is copy&paste of opencv.js dilate tutorial:
//   let dst = new cv.Mat();
//   let M = cv.Mat.ones(5, 5, cv.CV_8U);
//   let anchor = new cv.Point(-1, -1);
//   cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(src, src, 50, 200, 3);
    let lines = new cv.Mat();
    cv.HoughLines(src, lines, 1, Math.PI / 180,
              30, 0, 0, 0, Math.PI);

    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    cv.HoughLinesP(src, lines, 1, Math.PI / 180, 2, 0, 0);
    // draw lines
    let color = new cv.Scalar(255, 0, 0);
    for (let i = 0; i < lines.rows; ++i) {
        let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
        cv.line(dst, startPoint, endPoint, color);
    }
  // Now that we are finish, we want to write `dst` to file `output.png`. For this we create a `Jimp`
  // image which accepts the image data as a [`Buffer`](https://nodejs.org/docs/latest-v10.x/api/buffer.html).
  // `write('output.png')` will write it to disk and Jimp infers the output format from given file name:

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
