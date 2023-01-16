import { to1D, rowFrom1D, colFrom1D } from '../../../src/util/dimensionalMatrixMath';

describe('Dimensional matrix math tests', () => {
    test('Determining row from single-dimensional coordinate', () => {
        expect(rowFrom1D(0, 9)).toBe(0);
        expect(rowFrom1D(3, 9)).toBe(3);
        expect(rowFrom1D(9, 9)).toBe(0);
        expect(rowFrom1D(15, 9)).toBe(6);
    });

    test('Determining column from single-dimensional coordinate', () => {
        expect(colFrom1D(0, 9)).toBe(0);
        expect(colFrom1D(3, 9)).toBe(0);
        expect(colFrom1D(9, 9)).toBe(1);
        expect(colFrom1D(15, 9)).toBe(1);
        expect(colFrom1D(35, 9)).toBe(3);
    });

    test('Determining single-dimensional coordinate by row and column', () => {
        expect(to1D(0, 0, 9)).toBe(0);
        expect(to1D(3, 4, 9)).toBe(39);
        expect(to1D(8, 8, 9)).toBe(80);
    });
});
