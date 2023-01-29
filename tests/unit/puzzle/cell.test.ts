import { Cell } from '../../../src/puzzle/cell';
import { InvalidProblemDefError } from '../../../src/puzzle/invalidProblemDefError';

describe('Cell tests', () => {
    test('Construction of Cell using `at` method storing Row, Column and computing Nonet, key and `toString` representation', () => {
        const cell = Cell.at(4, 5);
        expect(cell.row).toBe(4);
        expect(cell.col).toBe(5);
        expect(cell.nonet).toBe(4);
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

    test('Construction of invalid Cell with Row outside of the range: <0', () => {
        expect(() => Cell.at(-1, 4)).toThrow(new InvalidProblemDefError('Invalid Cell. Row outside of range. Expected to be within [0, 9). Actual: -1'));
    });

    test('Construction of invalid Cell with Row outside of the range: >8', () => {
        expect(() => Cell.at(9, 4)).toThrow(new InvalidProblemDefError('Invalid Cell. Row outside of range. Expected to be within [0, 9). Actual: 9'));
    });

    test('Construction of invalid Cell with Column outside of the range: <0', () => {
        expect(() => Cell.at(4, -1)).toThrow(new InvalidProblemDefError('Invalid Cell. Column outside of range. Expected to be within [0, 9). Actual: -1'));
    });

    test('Construction of invalid Cell with Column outside of the range: >8', () => {
        expect(() => Cell.at(4, 9)).toThrow(new InvalidProblemDefError('Invalid Cell. Column outside of range. Expected to be within [0, 9). Actual: 9'));
    });

    test('Construction of invalid Cell using `atPosition` method', () => {
        expect(() => Cell.atPosition([ -1, 4 ])).toThrow(new InvalidProblemDefError('Invalid Cell. Row outside of range. Expected to be within [0, 9). Actual: -1'));
    });
});
