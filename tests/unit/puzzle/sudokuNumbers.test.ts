import { SudokuNumbers } from '../../../src/puzzle/sudokuNumbers';

describe('Unit tests for `SudokuNumbers`', () => {
    test('Minimum Sudoku number is 1', () => {
        expect(SudokuNumbers.MIN).toEqual(1);
    });

    test('Maximum Sudoku number is 9', () => {
        expect(SudokuNumbers.MAX).toEqual(9);
    });

    test('Range of possibe Sudoku numbers [1, 9]', () => {
        expect(SudokuNumbers.RANGE).toEqual([
            1, 2, 3, 4, 5, 6, 7, 8, 9
        ]);
    });
});
