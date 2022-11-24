import _ from 'lodash';
import { Cage } from '../../src/problem/cage';
import { Cell } from '../../src/problem/cell';

describe('Cage tests', () => {
    test('Construction of cage storing sum, cells and cell count', () => {
        const cage = Cage.ofSum(10).at(4, 4).at(4, 5).mk();
        expect(cage.sum).toBe(10);
        expect(cage.cellCount).toBe(2);
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
    });

    test('Construction of cage using cell builder method', () => {
        const cage = Cage.ofSum(10).cell(Cell.at(4, 4)).cell(Cell.at(4, 5)).mk();
        expect(cage.sum).toBe(10);
        expect(cage.cellCount).toBe(2);
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
    });

    test('Cage builder stores cell count', () => {
        const cageBuilder = Cage.ofSum(10);
        expect(cageBuilder.cellCount).toBe(0);
        cageBuilder.at(4, 4).at(4, 5);
        expect(cageBuilder.cellCount).toBe(2);
    });

    test('Cage cannot be constructed directly', () => {
        expect(() => new Cage(10, [ Cell.at(4, 4), Cell.at(4, 5) ])).toThrow(
            'Cage is not directly constructable. Use static builder Cage.ofSum instead'
        );
    });

    test('Construction of invalid cage with sum outside of the range: <1', () => {
        expect(() => Cage.ofSum(-1).at(4, 4).at(4, 5).mk()).toThrow(
            'Invalid cage. Sum outside of range. Expected to be within [1, 45]. Actual: -1'
        );
    });

    test('Construction of invalid cage with sum outside of the range: >45', () => {
        expect(() => Cage.ofSum(46).at(4, 4).at(4, 5).mk()).toThrow(
            'Invalid cage. Sum outside of range. Expected to be within [1, 45]. Actual: 46'
        );
    });

    test('Construction of invalid cage with a duplicate cell', () => {
        expect(() => Cage.ofSum(9).at(4, 4).at(4, 4).mk()).toThrow(
            'Invalid cage. 1 duplicate cell(s): (4, 4)'
        );
    });

    test('Construction of invalid cage with 2 duplicate cells', () => {
        expect(() => Cage.ofSum(9).at(0, 0).at(0, 1).at(0, 0).at(0, 1).mk()).toThrow(
            'Invalid cage. 2 duplicate cell(s): (0, 0), (0, 1)'
        );
    });

    test('Construction of invalid cage with undefined cell', () => {
        expect(() => Cage.ofSum(9).cell(undefined)).toThrow(
            'Invalid cell value. Expected to be instance of Cage. Actual: undefined'
        );
    });

    test('Construction of invalid cage with non-cell', () => {
        expect(() => Cage.ofSum(9).cell(4)).toThrow(
            'Invalid cell value. Expected to be instance of Cage. Actual: 4'
        );
    });

    test('Construction of invalid cage with more than 9 cells (cage cannot be bigger than a house)', () => {
        expect(() => Cage.ofSum(45)
                .at(0, 0).at(0, 1).at(0, 2).at(0, 3).at(0, 4).at(0, 5).at(0, 6).at(0, 7).at(0, 8)
                .at(1, 0)
                .mk()).toThrow(
            'Invalid cage. Cell count should be <= 9. Actual cell count: 10'
        );
    });

    test('Cage key', () => {
        expect(Cage.ofSum(10).at(4, 4).at(4, 5).mk().key).toBe(
            '10 [(4, 4), (4, 5)]');
    });

    test('Cage key stays the same regardless of cell order', () => {
        expect(Cage.ofSum(10).at(4, 4).at(4, 5).mk().key).toBe(
            Cage.ofSum(10).at(4, 5).at(4, 4).mk().key);
    });

    test('Cage toString', () => {
        expect(Cage.ofSum(10).at(4, 4).at(4, 5).mk().toString()).toBe(
            '10 [(4, 4), (4, 5)]');
    });
});
