import _ from 'lodash';
import { findSumCombinationsForSegment } from '../../src/solver/combinatorial';
import { Cage } from '../../src/problem/cage';

const houseSolverOf = (cages) => {
    let cellsMap = new Map();
    if (Array.isArray(cages)) {
        cages.forEach(cage => {
            cage.cells.forEach(cell => {
                cellsMap.set(cell.key(), cell);
            });
        });
    }
    return { cages, cells: Array.from(cellsMap.values()) };
}

describe('Tests for the finder of number combinations to form a house solver out of cages', () => {
    test('Multiple combinations of numbers to form a complete house solver with non-overlapping cages', () => {
        expect(findSumCombinationsForSegment(houseSolverOf([
            Cage.of(15).cell(1, 1).cell(1, 2).mk(),
            Cage.of(10).cell(1, 3).cell(2, 3).mk(),
            Cage.of(7).cell(2, 1).cell(2, 2).mk(),
            Cage.of(13).cell(3, 1).cell(3, 2).cell(3, 3).mk()
        ]))).toEqual([
            [ new Set([6, 9]), new Set([2, 8]), new Set([3, 4]), new Set([1, 5, 7]) ],
            [ new Set([6, 9]), new Set([3, 7]), new Set([2, 5]), new Set([1, 4, 8]) ],
            [ new Set([7, 8]), new Set([1, 9]), new Set([2, 5]), new Set([3, 4, 6]) ],
            [ new Set([7, 8]), new Set([1, 9]), new Set([3, 4]), new Set([2, 5, 6]) ],
            [ new Set([7, 8]), new Set([4, 6]), new Set([2, 5]), new Set([1, 3, 9]) ]
        ]);
    });

    test('Combination of numbers to form a complete house solver with non-overlapping cages', () => {
        expect(findSumCombinationsForSegment(houseSolverOf([
            Cage.of(4).cell(1, 1).cell(1, 2).mk(),
            Cage.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Cage.of(7).cell(1, 6).cell(1, 7).mk(),
            Cage.of(10).cell(1, 8).cell(1, 9).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([7, 8, 9]), new Set([2, 5]), new Set([4, 6]) ]
        ]);
    });

    test('Combinations of numbers to form an incomplete house solver with non-overlapping cages', () => {
        expect(findSumCombinationsForSegment(houseSolverOf([
            Cage.of(4).cell(1, 1).cell(1, 2).mk(),
            Cage.of(9).cell(1, 6).cell(1, 7).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([2, 7]) ],
            [ new Set([1, 3]), new Set([4, 5]) ]
        ]);
    });

    test('Combinations of numbers to form a house solver with overlapping cage', () => {
        expect(findSumCombinationsForSegment(houseSolverOf([
            Cage.of(8).cell(2, 5).cell(3, 5).mk(),
            Cage.of(8).cell(7, 5).mk(),
            // overlapping cage
            Cage.of(4).cell(1, 5).cell(2, 5).mk(),
            Cage.of(29).cell(0, 5).cell(1, 5).cell(4, 5).cell(5, 5).cell(6, 5).cell(8, 5).mk()
        ]))).toEqual([
            [ new Set([1, 7]), new Set([8]), new Set([1, 3]), new Set([2, 3, 4, 5, 6, 9]) ],
            [ new Set([2, 6]), new Set([8]), new Set([1, 3]), new Set([1, 3, 4, 5, 7, 9]) ],
            [ new Set([3, 5]), new Set([8]), new Set([1, 3]), new Set([1, 2, 4, 6, 7, 9]) ]
        ]);
    });

    test('Combinations of numbers to form a house solver out of invalid house solver', () => {
        expect(() => findSumCombinationsForSegment(undefined)).toThrow('Invalid houseSolver: undefined');
        expect(() => findSumCombinationsForSegment(null)).toThrow('Invalid houseSolver: null');
        expect(() => findSumCombinationsForSegment(1)).toThrow('Invalid houseSolver: 1');
        expect(() => findSumCombinationsForSegment('string')).toThrow('Invalid houseSolver: string');
        expect(() => findSumCombinationsForSegment(() => {})).toThrow('Invalid houseSolver: () => {}');
    });

    test('Combinations of numbers to form a house solver out of no cages', () => {
        expect(findSumCombinationsForSegment(houseSolverOf([]))).toEqual([]);
    });

    test('Combinations of numbers to form a house solver out of invalid house solver cages', () => {
        expect(() => findSumCombinationsForSegment(houseSolverOf(undefined))).toThrow('Invalid cages: undefined');
        expect(() => findSumCombinationsForSegment(houseSolverOf(null))).toThrow('Invalid cages: null');
        expect(() => findSumCombinationsForSegment(houseSolverOf({}))).toThrow('Invalid cages: [object Object]');
        expect(() => findSumCombinationsForSegment(houseSolverOf(3))).toThrow('Invalid cages: 3');
        expect(() => findSumCombinationsForSegment(houseSolverOf('string'))).toThrow('Invalid cages: string');
        expect(() => findSumCombinationsForSegment(houseSolverOf(() => {}))).toThrow('Invalid cages: () => {}');
    });

    test('Combinations of numbers to form a house solver out of invalid house solver cells', () => {
        expect(() => findSumCombinationsForSegment({ cages: [], cells: undefined })).toThrow('Invalid cells: undefined');
        expect(() => findSumCombinationsForSegment({ cages: [], cells: null })).toThrow('Invalid cells: null');
        expect(() => findSumCombinationsForSegment({ cages: [], cells: {} })).toThrow('Invalid cells: [object Object]');
        expect(() => findSumCombinationsForSegment({ cages: [], cells: 3 })).toThrow('Invalid cells: 3');
        expect(() => findSumCombinationsForSegment({ cages: [], cells: 'string' })).toThrow('Invalid cells: string');
        expect(() => findSumCombinationsForSegment({ cages: [], cells: () => {} })).toThrow('Invalid cells: () => {}');
    });

    test('Combinations of numbers to form a house solver out of too many cages with non-overlapping cells', () => {
        expect(() => findSumCombinationsForSegment(houseSolverOf(_.range(10).map(i => Cage.of(5).cell(i, 0).mk())))).toThrow(
            'Too many cages with non-overlapping cells. Expected no more than 9 cages. Actual: 10');
    });

    test('Combinations of numbers to form a house solver out of cages with non-overlapping cells whose total cage is greater than house max', () => {
        expect(() => findSumCombinationsForSegment(houseSolverOf([
            Cage.of(4).cell(1, 1).cell(1, 2).mk(),
            Cage.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Cage.of(7).cell(1, 6).cell(1, 7).mk(),
            Cage.of(100).cell(1, 8).cell(1, 9).mk()
        ]))).toThrow(
            "Total cage with non-overlapping cells should be <= 45. Actual: 135. Cages: ");
    });

    test('Combinations of numbers to form a houseSolver out of cages with too many non-overlapping cells', () => {
        expect(() => findSumCombinationsForSegment(houseSolverOf([
            Cage.of(4).cell(1, 1).cell(1, 2).mk(),
            Cage.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Cage.of(7).cell(1, 6).cell(1, 7).mk(),
            Cage.of(10).cell(1, 8).cell(1, 9).cell(2, 9).mk()
        ]))).toThrow(
            'Too many cells in cages with non-overlapping cells. Expected no more than 9 cells. Actual: 10');
    });
});
