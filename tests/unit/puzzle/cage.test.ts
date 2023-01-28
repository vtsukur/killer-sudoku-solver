import { Cage } from '../../../src/puzzle/cage';
import { Cell } from '../../../src/puzzle/cell';

describe('Cage tests', () => {
    test('Construction of Cage using `at` method storing sum, Cells, Cell count and computing key and toString representation', () => {
        const cage = Cage.ofSum(10).at(4, 4).at(4, 5).mk();
        expect(cage.sum).toBe(10);
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
        expect(cage.cellCount).toBe(2);
        expect(cage.key).toBe('10 [(4, 4), (4, 5)]');
        expect(cage.toString()).toBe('10 [(4, 4), (4, 5)]');
    });

    test('Construction of Cage using `withCell` method storing sum, Cells, Cell count and computing key and toString representation', () => {
        const cage = Cage.ofSum(10).withCell(Cell.at(4, 4)).withCell(Cell.at(4, 5)).mk();
        expect(cage.sum).toBe(10);
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
        expect(cage.cellCount).toBe(2);
        expect(cage.key).toBe('10 [(4, 4), (4, 5)]');
        expect(cage.toString()).toBe('10 [(4, 4), (4, 5)]');
    });

    test('Construction of Cage using `withCells` method storing sum, Cells, Cell count and computing key and toString representation', () => {
        const cage = Cage.ofSum(10).withCells([ Cell.at(4, 4), Cell.at(4, 5) ]).mk();
        expect(cage.sum).toBe(10);
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
        expect(cage.cellCount).toBe(2);
        expect(cage.key).toBe('10 [(4, 4), (4, 5)]');
        expect(cage.toString()).toBe('10 [(4, 4), (4, 5)]');
    });

    test('Cage.Builder stores Cells and their count', () => {
        const cageBuilder = Cage.ofSum(10);
        expect(cageBuilder.cellCount).toBe(0);
        expect(cageBuilder.cells).toEqual([]);
        cageBuilder.at(4, 4).at(4, 5);
        expect(cageBuilder.cellCount).toBe(2);
        expect(cageBuilder.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
    });

    test('Construction of invalid Cage with no Cells', () => {
        expect(() => Cage.ofSum(8).mk()).toThrow(
            'Invalid cage. No cells registered. At least one cell should be a part of cage grouping'
        );
    });

    test('Construction of invalid Cage with sum outside of the range: <1', () => {
        expect(() => Cage.ofSum(-1)).toThrow(
            'Invalid cage. Sum outside of range. Expected to be within [1, 406). Actual: -1'
        );
    });

    test('Construction of invalid Cage with sum outside of the range: >405', () => {
        expect(() => Cage.ofSum(406)).toThrow(
            'Invalid cage. Sum outside of range. Expected to be within [1, 406). Actual: 406'
        );
    });

    test('Construction of invalid Cage with a duplicate Cell', () => {
        expect(() => Cage.ofSum(9).at(4, 4).at(4, 4).mk()).toThrow(
            'Invalid cage. Found duplicate cell: (4, 4)'
        );
    });

    test('Cage key stays the same regardless of Cell order', () => {
        expect(Cage.ofSum(10).at(4, 4).at(4, 5).mk().key).toBe(
            Cage.ofSum(10).at(4, 5).at(4, 4).mk().key);
    });
});
