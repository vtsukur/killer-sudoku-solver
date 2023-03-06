import { Cell } from '../../../src/puzzle/cell';
import { GridMatrix } from '../../../src/puzzle/gridMatrix';
import { InvalidPuzzleDefError } from '../../../src/puzzle/invalidPuzzleDefError';

describe('Cell tests', () => {
    test('Construction of Cell using `at` method storing Row, Column and computing Nonet, key and `toString` representation', () => {
        const cell = Cell.at(4, 5);
        expect(cell.row).toBe(4);
        expect(cell.col).toBe(5);
        expect(cell.nonet).toBe(4);
        expect(cell.index).toBe(41);
        expect(cell.key).toBe('(4, 5)');
        expect(cell.toString()).toBe('(4, 5)');
    });

    test('Construction of Cell using `atPosition` method', () => {
        const cell = Cell.atPosition([ 4, 5 ]);
        expect(cell.row).toBe(4);
        expect(cell.col).toBe(5);
    });

    test('There is only one Cell with the same position', () => {
        expect(Cell.at(4, 5)).toBe(Cell.at(4, 5));
        expect(Cell.atPosition([ 4, 5 ])).toBe(Cell.atPosition([ 4, 5 ]));
        expect(Cell.at(4, 5)).toBe(Cell.atPosition([ 4, 5 ]));
    });

    test('Cells are indexed consequently from top left position of the `Grid` to the right bottom one', () => {
        let index = 0;
        for (const row of GridMatrix.SIDE_INDICES_RANGE) {
            for (const col of GridMatrix.SIDE_INDICES_RANGE) {
                expect(Cell.at(row, col).index).toBe(index++);
            }
        }
    });

    test('Construction of invalid Cell with Row outside of the range: <0', () => {
        expect(() => Cell.at(-1, 4)).toThrow(new InvalidPuzzleDefError('Invalid House index. Row outside of range. Expected to be within [0, 9). Actual: -1'));
    });

    test('Construction of invalid Cell with Row outside of the range: >8', () => {
        expect(() => Cell.at(9, 4)).toThrow(new InvalidPuzzleDefError('Invalid House index. Row outside of range. Expected to be within [0, 9). Actual: 9'));
    });

    test('Construction of invalid Cell with Column outside of the range: <0', () => {
        expect(() => Cell.at(4, -1)).toThrow(new InvalidPuzzleDefError('Invalid House index. Column outside of range. Expected to be within [0, 9). Actual: -1'));
    });

    test('Construction of invalid Cell with Column outside of the range: >8', () => {
        expect(() => Cell.at(4, 9)).toThrow(new InvalidPuzzleDefError('Invalid House index. Column outside of range. Expected to be within [0, 9). Actual: 9'));
    });

    test('Construction of invalid Cell using `atPosition` method', () => {
        expect(() => Cell.atPosition([ -1, 4 ])).toThrow(new InvalidPuzzleDefError('Invalid House index. Row outside of range. Expected to be within [0, 9). Actual: -1'));
    });
});
