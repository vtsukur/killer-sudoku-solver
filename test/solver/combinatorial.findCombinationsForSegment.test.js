import _ from 'lodash';
import { findSumCombinationsForHouse } from '../../src/solver/combinatorial';
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
        expect(findSumCombinationsForHouse(houseSolverOf([
            Cage.ofSum(15).at(1, 1).at(1, 2).mk(),
            Cage.ofSum(10).at(1, 3).at(2, 3).mk(),
            Cage.ofSum(7).at(2, 1).at(2, 2).mk(),
            Cage.ofSum(13).at(3, 1).at(3, 2).at(3, 3).mk()
        ]))).toEqual([
            [ new Set([6, 9]), new Set([2, 8]), new Set([3, 4]), new Set([1, 5, 7]) ],
            [ new Set([6, 9]), new Set([3, 7]), new Set([2, 5]), new Set([1, 4, 8]) ],
            [ new Set([7, 8]), new Set([1, 9]), new Set([2, 5]), new Set([3, 4, 6]) ],
            [ new Set([7, 8]), new Set([1, 9]), new Set([3, 4]), new Set([2, 5, 6]) ],
            [ new Set([7, 8]), new Set([4, 6]), new Set([2, 5]), new Set([1, 3, 9]) ]
        ]);
    });

    test('Combination of numbers to form a complete house solver with non-overlapping cages', () => {
        expect(findSumCombinationsForHouse(houseSolverOf([
            Cage.ofSum(4).at(1, 1).at(1, 2).mk(),
            Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).mk(),
            Cage.ofSum(7).at(1, 6).at(1, 7).mk(),
            Cage.ofSum(10).at(1, 8).at(1, 9).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([7, 8, 9]), new Set([2, 5]), new Set([4, 6]) ]
        ]);
    });

    test('Combinations of numbers to form an incomplete house solver with non-overlapping cages', () => {
        expect(findSumCombinationsForHouse(houseSolverOf([
            Cage.ofSum(4).at(1, 1).at(1, 2).mk(),
            Cage.ofSum(9).at(1, 6).at(1, 7).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([2, 7]) ],
            [ new Set([1, 3]), new Set([4, 5]) ]
        ]);
    });

    test('Combinations of numbers to form a house solver with overlapping cage', () => {
        expect(findSumCombinationsForHouse(houseSolverOf([
            Cage.ofSum(8).at(2, 5).at(3, 5).mk(),
            Cage.ofSum(8).at(7, 5).mk(),
            // overlapping cage
            Cage.ofSum(4).at(1, 5).at(2, 5).mk(),
            Cage.ofSum(29).at(0, 5).at(1, 5).at(4, 5).at(5, 5).at(6, 5).at(8, 5).mk()
        ]))).toEqual([
            [ new Set([1, 7]), new Set([8]), new Set([1, 3]), new Set([2, 3, 4, 5, 6, 9]) ],
            [ new Set([2, 6]), new Set([8]), new Set([1, 3]), new Set([1, 3, 4, 5, 7, 9]) ],
            [ new Set([3, 5]), new Set([8]), new Set([1, 3]), new Set([1, 2, 4, 6, 7, 9]) ]
        ]);
    });

    test('Combinations of numbers to form a house solver out of invalid house solver', () => {
        expect(() => findSumCombinationsForHouse(undefined)).toThrow('Invalid houseSolver: undefined');
        expect(() => findSumCombinationsForHouse(null)).toThrow('Invalid houseSolver: null');
        expect(() => findSumCombinationsForHouse(1)).toThrow('Invalid houseSolver: 1');
        expect(() => findSumCombinationsForHouse('string')).toThrow('Invalid houseSolver: string');
        expect(() => findSumCombinationsForHouse(() => {})).toThrow('Invalid houseSolver: () => {}');
    });

    test('Combinations of numbers to form a house solver out of no cages', () => {
        expect(findSumCombinationsForHouse(houseSolverOf([]))).toEqual([]);
    });

    test('Combinations of numbers to form a house solver out of invalid house solver cages', () => {
        expect(() => findSumCombinationsForHouse(houseSolverOf(undefined))).toThrow('Invalid cages: undefined');
        expect(() => findSumCombinationsForHouse(houseSolverOf(null))).toThrow('Invalid cages: null');
        expect(() => findSumCombinationsForHouse(houseSolverOf({}))).toThrow('Invalid cages: [object Object]');
        expect(() => findSumCombinationsForHouse(houseSolverOf(3))).toThrow('Invalid cages: 3');
        expect(() => findSumCombinationsForHouse(houseSolverOf('string'))).toThrow('Invalid cages: string');
        expect(() => findSumCombinationsForHouse(houseSolverOf(() => {}))).toThrow('Invalid cages: () => {}');
    });

    test('Combinations of numbers to form a house solver out of invalid house solver cells', () => {
        expect(() => findSumCombinationsForHouse({ cages: [], cells: undefined })).toThrow('Invalid cells: undefined');
        expect(() => findSumCombinationsForHouse({ cages: [], cells: null })).toThrow('Invalid cells: null');
        expect(() => findSumCombinationsForHouse({ cages: [], cells: {} })).toThrow('Invalid cells: [object Object]');
        expect(() => findSumCombinationsForHouse({ cages: [], cells: 3 })).toThrow('Invalid cells: 3');
        expect(() => findSumCombinationsForHouse({ cages: [], cells: 'string' })).toThrow('Invalid cells: string');
        expect(() => findSumCombinationsForHouse({ cages: [], cells: () => {} })).toThrow('Invalid cells: () => {}');
    });

    test('Combinations of numbers to form a house solver out of too many cages with non-overlapping cells', () => {
        expect(() => findSumCombinationsForHouse(houseSolverOf(_.range(10).map(i => Cage.ofSum(5).at(i, 0).mk())))).toThrow(
            'Too many cages with non-overlapping cells. Expected no more than 9 cages. Actual: 10');
    });

    test('Combinations of numbers to form a house solver out of cages with non-overlapping cells whose total cage is greater than house max', () => {
        expect(() => findSumCombinationsForHouse(houseSolverOf([
            Cage.ofSum(4).at(1, 1).at(1, 2).mk(),
            Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).mk(),
            Cage.ofSum(7).at(1, 6).at(1, 7).mk(),
            Cage.ofSum(100).at(1, 8).at(1, 9).mk()
        ]))).toThrow(
            "Total cage with non-overlapping cells should be <= 45. Actual: 135. Cages: ");
    });

    test('Combinations of numbers to form a houseSolver out of cages with too many non-overlapping cells', () => {
        expect(() => findSumCombinationsForHouse(houseSolverOf([
            Cage.ofSum(4).at(1, 1).at(1, 2).mk(),
            Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).mk(),
            Cage.ofSum(7).at(1, 6).at(1, 7).mk(),
            Cage.ofSum(10).at(1, 8).at(1, 9).at(2, 9).mk()
        ]))).toThrow(
            'Too many cells in cages with non-overlapping cells. Expected no more than 9 cells. Actual: 10');
    });
});
