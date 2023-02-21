import { Cage } from '../../../src/puzzle/cage';
import { Cell } from '../../../src/puzzle/cell';
import { InvalidPuzzleDefError } from '../../../src/puzzle/invalidPuzzleDefError';
import { CellIndicesCheckingSet } from '../../../src/solver/math';

describe('Cage tests', () => {
    test('Construction of Cage using `Cage.Builder.at` method', () => {
        const cage = Cage.ofSum(10).at(4, 4).at(4, 5).new();
        expect(cage.sum).toBe(10);
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
        expect(cage.cellCount).toBe(2);
        expect(cage.isInput).toBeTruthy();
        expect(cage.cellIndices.equals(CellIndicesCheckingSet.of(40, 41))).toBeTruthy();
        expect(cage.key).toBe('10 [(4, 4), (4, 5)]');
        expect(cage.toString()).toBe('10 [(4, 4), (4, 5)]');
        expect(cage.tsConstructionCode).toBe('Cage.ofSum(10).at(4, 4).at(4, 5).new()');
    });

    test('Construction of Cage using `Cage.Builder.withCell` method', () => {
        const cage = Cage.ofSum(10).withCell(Cell.at(4, 4)).withCell(Cell.at(4, 5)).new();
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
        expect(cage.cellCount).toBe(2);
    });

    test('Construction of Cage using `Cage.Builder.withCells` method', () => {
        const cage = Cage.ofSum(10).withCells([ Cell.at(4, 4), Cell.at(4, 5) ]).new();
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
        expect(cage.cellCount).toBe(2);
    });

    test('Cage.Builder stores Cells and their count', () => {
        const cageBuilder = Cage.ofSum(10);
        expect(cageBuilder.cellCount).toBe(0);
        expect(cageBuilder.cells).toEqual([]);
        cageBuilder.at(4, 4).at(4, 5);
        expect(cageBuilder.cellCount).toBe(2);
        expect(cageBuilder.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
    });

    test('Cage.Builder overrides `isInput` if instructed', () => {
        expect(Cage.ofSum(10).at(4, 4).at(4, 5).setIsInput(false).new().isInput).toBeFalsy();
    });

    test('Cage key stays the same regardless of Cell order', () => {
        expect(Cage.ofSum(10).at(4, 4).at(4, 5).new().key).toBe(
            Cage.ofSum(10).at(4, 5).at(4, 4).new().key);
    });

    test('Construction of invalid Cage with sum outside of the range: <1', () => {
        expect(() => Cage.ofSum(-1)).toThrow(
            new InvalidPuzzleDefError('Invalid Cage. Sum outside of range. Expected to be within [1, 406). Actual: -1')
        );
    });

    test('Construction of invalid Cage with sum outside of the range: >405', () => {
        expect(() => Cage.ofSum(406)).toThrow(
            new InvalidPuzzleDefError('Invalid Cage. Sum outside of range. Expected to be within [1, 406). Actual: 406')
        );
    });

    test('Construction of invalid Cage with a duplicate Cell', () => {
        expect(() => Cage.ofSum(9).at(4, 4).at(4, 4).new()).toThrow(
            new InvalidPuzzleDefError('Invalid Cage. Found duplicate Cell: (4, 4)')
        );
    });

    test('Construction of invalid Cage with no Cells', () => {
        expect(() => Cage.ofSum(8).new()).toThrow(
            new InvalidPuzzleDefError('Invalid Cage. No Cells registered. At least one Cell should be a part of Cage grouping')
        );
    });
});
