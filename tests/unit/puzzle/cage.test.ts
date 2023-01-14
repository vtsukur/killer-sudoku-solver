import { Cage } from '../../../src/puzzle/cage';
import { Cell } from '../../../src/puzzle/cell';

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

    test('Construction of invalid cage with sum outside of the range: <1', () => {
        expect(() => Cage.ofSum(-1)).toThrow(
            'Invalid cage. Sum outside of range. Expected to be within [1, 406). Actual: -1'
        );
    });

    test('Construction of invalid cage with sum outside of the range: >405', () => {
        expect(() => Cage.ofSum(406)).toThrow(
            'Invalid cage. Sum outside of range. Expected to be within [1, 406). Actual: 406'
        );
    });

    test('Construction of invalid cage with a duplicate cell', () => {
        expect(() => Cage.ofSum(9).at(4, 4).at(4, 4).mk()).toThrow(
            'Invalid cage. Found duplicate cell: (4, 4)'
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
