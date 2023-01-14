import * as _ from 'lodash';
import { Cell } from '../../../src/puzzle/cell';

describe('Cell tests', () => {
    test('Construction of cell storing row, column and computing nonet, key, toString representation and index within grid', () => {
        const cell = Cell.at(4, 5);
        expect(cell.row).toBe(4);
        expect(cell.col).toBe(5);
        expect(cell.nonet).toBe(4);
        expect(cell.key).toBe('(4, 5)');
        expect(cell.toString()).toBe('(4, 5)');
        expect(cell.indexWithinGrid).toBe(41);
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
});
