import _ from 'lodash';
import { findSumCombinationsForHouse } from '../../../../src/solver/combinatorial/combinatorial';
import { Cage } from '../../../../src/puzzle/cage';
import { CageModel } from '../../../../src/solver/models/elements/cageModel';

const houseModelOf = (cages) => {
    let cellsMap = new Map();
    if (Array.isArray(cages)) {
        cages.forEach(cage => {
            cage.cells.forEach(cell => {
                cellsMap.set(cell.key, cell);
            });
        });
    }
    const cageModels = cages.map(cage => new CageModel(cage, []));
    return { cageModels, cells: Array.from(cellsMap.values()) };
}

describe('Tests for the finder of number combinations to form a house model out of cages', () => {
    test('Multiple combinations of numbers to form a complete house model with non-overlapping cages', () => {
        expect(findSumCombinationsForHouse(houseModelOf([
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

    test('Combination of numbers to form a complete house model with non-overlapping cages', () => {
        expect(findSumCombinationsForHouse(houseModelOf([
            Cage.ofSum(4).at(1, 1).at(1, 2).mk(),
            Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).mk(),
            Cage.ofSum(7).at(1, 6).at(1, 7).mk(),
            Cage.ofSum(4).at(1, 8).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([7, 8, 9]), new Set([2, 5]), new Set([4]) ]
        ]);
    });

    test('Combinations of numbers to form an incomplete house model with non-overlapping cages', () => {
        expect(findSumCombinationsForHouse(houseModelOf([
            Cage.ofSum(4).at(1, 1).at(1, 2).mk(),
            Cage.ofSum(9).at(1, 6).at(1, 7).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([2, 7]) ],
            [ new Set([1, 3]), new Set([4, 5]) ]
        ]);
    });

    test('Combinations of numbers to form a house model with overlapping cage', () => {
        expect(findSumCombinationsForHouse(houseModelOf([
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

    test('Combinations of numbers to form a house model out of invalid house model', () => {
        expect(() => findSumCombinationsForHouse(undefined)).toThrow('Invalid houseModel: undefined');
        expect(() => findSumCombinationsForHouse(null)).toThrow('Invalid houseModel: null');
        expect(() => findSumCombinationsForHouse(1)).toThrow('Invalid houseModel: 1');
        expect(() => findSumCombinationsForHouse('string')).toThrow('Invalid houseModel: string');
        expect(() => findSumCombinationsForHouse(() => {})).toThrow('Invalid houseModel: () => {}');
    });

    test('Combinations of numbers to form a house model out of no cages', () => {
        expect(findSumCombinationsForHouse(houseModelOf([]))).toEqual([]);
    });

    test('Combinations of numbers to form a house model out of cages with non-overlapping cells whose total sum is greater than house max', () => {
        expect(() => findSumCombinationsForHouse(houseModelOf([
            Cage.ofSum(4).at(1, 1).at(1, 2).mk(),
            Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).mk(),
            Cage.ofSum(12).at(1, 6).at(1, 7).mk(),
            Cage.ofSum(6).at(1, 8).mk()
        ]))).toThrow(
            'Total cage with non-overlapping cells should be <= 45. Actual: 46. Cages: ');
    });
});
