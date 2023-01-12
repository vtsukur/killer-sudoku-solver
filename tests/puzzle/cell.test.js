import _ from 'lodash';
import { Cell } from '../../src/puzzle/cell';

describe('Cell tests', () => {
    test('Construction of cell storing row, column and nonet', () => {
        const cell = Cell.at(4, 4);
        expect(cell.row).toBe(4);
        expect(cell.col).toBe(4);
        expect(cell.nonet).toBe(4);
    });

    test('Construction of invalid cell with row outside of the range: <0', () => {
        expect(() => Cell.at(-1, 4)).toThrow('Invalid cell. Row outside of range. Expected to be within [0, 9). Actual: -1');
    });

    test('Construction of invalid cell with row outside of the range: >8', () => {
        expect(() => Cell.at(9, 4)).toThrow('Invalid cell. Row outside of range. Expected to be within [0, 9). Actual: 9');
    });

    test('Construction of invalid cell with column outside of the range: <0', () => {
        expect(() => Cell.at(4, -1)).toThrow('Invalid cell. Column outside of range. Expected to be within [0, 9). Actual: -1');
    });

    test('Construction of invalid cell with column outside of the range: >8', () => {
        expect(() => Cell.at(4, 9)).toThrow('Invalid cell. Column outside of range. Expected to be within [0, 9). Actual: 9');
    });

    test('Cell key', () => {
        expect(Cell.at(4, 5).key).toBe('(4, 5)');
    });

    test('Cell toString', () => {
        expect(Cell.at(4, 5).toString()).toBe('(4, 5)');
    });
});
