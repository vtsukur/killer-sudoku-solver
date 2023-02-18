import { SudokuNums } from '../../../src/puzzle/sudokuNums';

describe('Unit tests for `SudokuNums`', () => {
    test('Minimum Sudoku number is 1', () => {
        expect(SudokuNums.MIN).toEqual(1);
    });

    test('Maximum Sudoku number is 9', () => {
        expect(SudokuNums.MAX).toEqual(9);
    });

    test('Range of possibe Sudoku numbers [1, 9]', () => {
        expect(SudokuNums.RANGE).toEqual([
            1, 2, 3, 4, 5, 6, 7, 8, 9
        ]);
    });
});
