import _ from 'lodash';
import { findSumCombinationsForSegment } from '../src/combinatorial';
import { Sum } from '../src/problem';

const segmentOf = (sums) => {
    let cellsMap = new Map();
    if (Array.isArray(sums)) {
        sums.forEach(sum => {
            sum.cells.forEach(cell => {
                cellsMap.set(cell.key(), cell);
            });
        });
    }
    return { sums, cells: Array.from(cellsMap.values()) };
}

describe('Tests for the finder of number combinations to form a segment out of sums', () => {
    test('Multiple combinations of numbers to form a complete segment with non-overlapping sums', () => {
        expect(findSumCombinationsForSegment(segmentOf([
            Sum.of(15).cell(1, 1).cell(1, 2).mk(),
            Sum.of(10).cell(1, 3).cell(2, 3).mk(),
            Sum.of(7).cell(2, 1).cell(2, 2).mk(),
            Sum.of(13).cell(3, 1).cell(3, 2).cell(3, 3).mk()
        ]))).toEqual([
            [ new Set([6, 9]), new Set([2, 8]), new Set([3, 4]), new Set([1, 5, 7]) ],
            [ new Set([6, 9]), new Set([3, 7]), new Set([2, 5]), new Set([1, 4, 8]) ],
            [ new Set([7, 8]), new Set([1, 9]), new Set([2, 5]), new Set([3, 4, 6]) ],
            [ new Set([7, 8]), new Set([1, 9]), new Set([3, 4]), new Set([2, 5, 6]) ],
            [ new Set([7, 8]), new Set([4, 6]), new Set([2, 5]), new Set([1, 3, 9]) ]
        ]);
    });

    test('Combination of numbers to form a complete segment with non-overlapping sums', () => {
        expect(findSumCombinationsForSegment(segmentOf([
            Sum.of(4).cell(1, 1).cell(1, 2).mk(),
            Sum.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Sum.of(7).cell(1, 6).cell(1, 7).mk(),
            Sum.of(10).cell(1, 8).cell(1, 9).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([7, 8, 9]), new Set([2, 5]), new Set([4, 6]) ]
        ]);
    });

    test('Combinations of numbers to form an incomplete segment with non-overlapping sums', () => {
        expect(findSumCombinationsForSegment(segmentOf([
            Sum.of(4).cell(1, 1).cell(1, 2).mk(),
            Sum.of(9).cell(1, 6).cell(1, 7).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([2, 7]) ],
            [ new Set([1, 3]), new Set([4, 5]) ]
        ]);
    });

    test('Combinations of numbers to form a segment out of invalid segment', () => {
        expect(() => findSumCombinationsForSegment(undefined)).toThrow('Invalid segment: undefined');
        expect(() => findSumCombinationsForSegment(null)).toThrow('Invalid segment: null');
        expect(() => findSumCombinationsForSegment(1)).toThrow('Invalid segment: 1');
        expect(() => findSumCombinationsForSegment('string')).toThrow('Invalid segment: string');
        expect(() => findSumCombinationsForSegment(() => {})).toThrow('Invalid segment: () => {}');
    });

    test('Combinations of numbers to form a segment out of no sums', () => {
        expect(findSumCombinationsForSegment(segmentOf([]))).toEqual([]);
    });

    test('Combinations of numbers to form a segment out of invalid segment sums', () => {
        expect(() => findSumCombinationsForSegment(segmentOf(undefined))).toThrow('Invalid sums: undefined');
        expect(() => findSumCombinationsForSegment(segmentOf(null))).toThrow('Invalid sums: null');
        expect(() => findSumCombinationsForSegment(segmentOf({}))).toThrow('Invalid sums: [object Object]');
        expect(() => findSumCombinationsForSegment(segmentOf(3))).toThrow('Invalid sums: 3');
        expect(() => findSumCombinationsForSegment(segmentOf('string'))).toThrow('Invalid sums: string');
        expect(() => findSumCombinationsForSegment(segmentOf(() => {}))).toThrow('Invalid sums: () => {}');
    });

    test('Combinations of numbers to form a segment out of invalid segment cells', () => {
        expect(() => findSumCombinationsForSegment({ sums: [], cells: undefined })).toThrow('Invalid cells: undefined');
        expect(() => findSumCombinationsForSegment({ sums: [], cells: null })).toThrow('Invalid cells: null');
        expect(() => findSumCombinationsForSegment({ sums: [], cells: {} })).toThrow('Invalid cells: [object Object]');
        expect(() => findSumCombinationsForSegment({ sums: [], cells: 3 })).toThrow('Invalid cells: 3');
        expect(() => findSumCombinationsForSegment({ sums: [], cells: 'string' })).toThrow('Invalid cells: string');
        expect(() => findSumCombinationsForSegment({ sums: [], cells: () => {} })).toThrow('Invalid cells: () => {}');
    });

    test('Combinations of numbers to form a segment out of too many sums with non-overlapping cells', () => {
        expect(() => findSumCombinationsForSegment(segmentOf(_.range(10).map(i => Sum.of(5).cell(i, 0).mk())))).toThrow(
            'Too many sums with non-overlapping cells. Expected no more than 9 sums. Actual: 10');
    });

    test('Combinations of numbers to form a segment out of sums with non-overlapping cells whose total sum is greater than segments max', () => {
        expect(() => findSumCombinationsForSegment(segmentOf([
            Sum.of(4).cell(1, 1).cell(1, 2).mk(),
            Sum.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Sum.of(7).cell(1, 6).cell(1, 7).mk(),
            Sum.of(100).cell(1, 8).cell(1, 9).mk()
        ]))).toThrow(
            "Total sum with non-overlapping cells should be <= 45. Actual: 135. Sums: ");
    });

    test('Combinations of numbers to form a segment out of sums with too many non-overlapping cells', () => {
        expect(() => findSumCombinationsForSegment(segmentOf([
            Sum.of(4).cell(1, 1).cell(1, 2).mk(),
            Sum.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Sum.of(7).cell(1, 6).cell(1, 7).mk(),
            Sum.of(10).cell(1, 8).cell(1, 9).cell(2, 9).mk()
        ]))).toThrow(
            'Too many cells in sums with non-overlapping cells. Expected no more than 9 cells. Actual: 10');
    });
});
