import _ from 'lodash';
import { findCombinationsForSegment } from '../src/combinatorial';
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

describe('Tests for the finder of digit combinations to form a segment out of sums', () => {
    test('Multiple combinations of digits to form a complete segment', () => {
        expect(findCombinationsForSegment(segmentOf([
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

    test('Single combination of digits to form a complete segment', () => {
        expect(findCombinationsForSegment(segmentOf([
            Sum.of(4).cell(1, 1).cell(1, 2).mk(),
            Sum.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Sum.of(7).cell(1, 6).cell(1, 7).mk(),
            Sum.of(10).cell(1, 8).cell(1, 9).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([7, 8, 9]), new Set([2, 5]), new Set([4, 6]) ]
        ]);
    });

    test('Combinations of digits to form an incomplete segment', () => {
        expect(findCombinationsForSegment(segmentOf([
            Sum.of(4).cell(1, 1).cell(1, 2).mk(),
            Sum.of(9).cell(1, 6).cell(1, 7).mk()
        ]))).toEqual([
            [ new Set([1, 3]), new Set([2, 7]) ],
            [ new Set([1, 3]), new Set([4, 5]) ]
        ]);
    });

    test('Combinations of digits to form a segment out of invalid segment', () => {
        expect(() => findCombinationsForSegment(undefined)).toThrow('Invalid segment: undefined');
        expect(() => findCombinationsForSegment(null)).toThrow('Invalid segment: null');
        expect(() => findCombinationsForSegment(1)).toThrow('Invalid segment: 1');
        expect(() => findCombinationsForSegment('string')).toThrow('Invalid segment: string');
        expect(() => findCombinationsForSegment(() => {})).toThrow('Invalid segment: () => {}');
    });

    test('Combinations of digits to form a segment out of no sums', () => {
        expect(findCombinationsForSegment(segmentOf([]))).toEqual([]);
    });

    test('Combinations of digits to form a segment out of too many sums with non-overlapping cells', () => {
        expect(() => findCombinationsForSegment(segmentOf(_.range(10).map(i => Sum.of(5).cell(i, 0).mk())))).toThrow(
            'Too many sums with non-overlapping cells. Expected no more than 9 sums. Actual: 10');
    });

    test('Combinations of digits to form a segment out of sums with non-overlapping cells whose total sum is greater than segments max', () => {
        expect(() => findCombinationsForSegment(segmentOf([
            Sum.of(4).cell(1, 1).cell(1, 2).mk(),
            Sum.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Sum.of(7).cell(1, 6).cell(1, 7).mk(),
            Sum.of(100).cell(1, 8).cell(1, 9).mk()
        ]))).toThrow(
            "Total sum with non-overlapping cells should be <= 45. Actual: 135. Sums: ");
    });

    test('Combinations of digits to form a segment out of invalid sums', () => {
        expect(() => findCombinationsForSegment(segmentOf(undefined))).toThrow('Invalid sums: undefined');
        expect(() => findCombinationsForSegment(segmentOf(null))).toThrow('Invalid sums: null');
        expect(() => findCombinationsForSegment(segmentOf({}))).toThrow('Invalid sums: [object Object]');
        expect(() => findCombinationsForSegment(segmentOf(3))).toThrow('Invalid sums: 3');
        expect(() => findCombinationsForSegment(segmentOf('3'))).toThrow('Invalid sums: 3');
    });

    test('Combinations of digits to form a segment out of sums with too many non-overlapping cells', () => {
        expect(() => findCombinationsForSegment(segmentOf([
            Sum.of(4).cell(1, 1).cell(1, 2).mk(),
            Sum.of(24).cell(1, 3).cell(1, 4).cell(1, 5).mk(),
            Sum.of(7).cell(1, 6).cell(1, 7).mk(),
            Sum.of(10).cell(1, 8).cell(1, 9).cell(2, 9).mk()
        ]))).toThrow(
            'Too many cells in sums with non-overlapping cells. Expected no more than 9 cells. Actual: 10');
    });
});
