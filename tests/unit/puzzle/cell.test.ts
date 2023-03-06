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

    test('`Cell.GRID` contains all possible `Cell`s', () => {
        expect(Cell.GRID).toEqual([
            [ Cell.at(0, 0), Cell.at(0, 1), Cell.at(0, 2), Cell.at(0, 3), Cell.at(0, 4), Cell.at(0, 5), Cell.at(0, 6), Cell.at(0, 7), Cell.at(0, 8) ],
            [ Cell.at(1, 0), Cell.at(1, 1), Cell.at(1, 2), Cell.at(1, 3), Cell.at(1, 4), Cell.at(1, 5), Cell.at(1, 6), Cell.at(1, 7), Cell.at(1, 8) ],
            [ Cell.at(2, 0), Cell.at(2, 1), Cell.at(2, 2), Cell.at(2, 3), Cell.at(2, 4), Cell.at(2, 5), Cell.at(2, 6), Cell.at(2, 7), Cell.at(2, 8) ],
            [ Cell.at(3, 0), Cell.at(3, 1), Cell.at(3, 2), Cell.at(3, 3), Cell.at(3, 4), Cell.at(3, 5), Cell.at(3, 6), Cell.at(3, 7), Cell.at(3, 8) ],
            [ Cell.at(4, 0), Cell.at(4, 1), Cell.at(4, 2), Cell.at(4, 3), Cell.at(4, 4), Cell.at(4, 5), Cell.at(4, 6), Cell.at(4, 7), Cell.at(4, 8) ],
            [ Cell.at(5, 0), Cell.at(5, 1), Cell.at(5, 2), Cell.at(5, 3), Cell.at(5, 4), Cell.at(5, 5), Cell.at(5, 6), Cell.at(5, 7), Cell.at(5, 8) ],
            [ Cell.at(6, 0), Cell.at(6, 1), Cell.at(6, 2), Cell.at(6, 3), Cell.at(6, 4), Cell.at(6, 5), Cell.at(6, 6), Cell.at(6, 7), Cell.at(6, 8) ],
            [ Cell.at(7, 0), Cell.at(7, 1), Cell.at(7, 2), Cell.at(7, 3), Cell.at(7, 4), Cell.at(7, 5), Cell.at(7, 6), Cell.at(7, 7), Cell.at(7, 8) ],
            [ Cell.at(8, 0), Cell.at(8, 1), Cell.at(8, 2), Cell.at(8, 3), Cell.at(8, 4), Cell.at(8, 5), Cell.at(8, 6), Cell.at(8, 7), Cell.at(8, 8) ]
        ]);
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
