import { to1D, xFrom1D, yFrom1D } from '../../../src/util/dimensionalMatrixMath';

describe('Dimensional matrix math tests', () => {
    test('Determining x coordinate from single-dimensional coordinate', () => {
        expect(xFrom1D(0, 9)).toBe(0);
        expect(xFrom1D(3, 9)).toBe(3);
        expect(xFrom1D(9, 9)).toBe(0);
        expect(xFrom1D(15, 9)).toBe(6);
    });

    test('Determining y coordinate from single-dimensional coordinate', () => {
        expect(yFrom1D(0, 9)).toBe(0);
        expect(yFrom1D(3, 9)).toBe(0);
        expect(yFrom1D(9, 9)).toBe(1);
        expect(yFrom1D(15, 9)).toBe(1);
        expect(yFrom1D(35, 9)).toBe(3);
    });

    test('Determining single-dimensional coordinate by x and y coordinates', () => {
        expect(to1D(0, 0, 9)).toBe(0);
        expect(to1D(3, 4, 9)).toBe(39);
        expect(to1D(8, 8, 9)).toBe(80);
    });
});
