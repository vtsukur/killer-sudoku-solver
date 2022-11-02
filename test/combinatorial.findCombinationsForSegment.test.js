import _ from 'lodash';
import { findCombinationsForSegment } from '../src/combinatorial';
import { Cell, Sum } from '../src/problem';

describe('Tests for the finder of digit combinations to form a segment out of sums', () => {
    test('Multiple combinations of digits to form a complete segment', () => {
        expect(findCombinationsForSegment([
            new Sum(15, [ new Cell(1, 1), new Cell(1, 2)]),
            new Sum(10, [ new Cell(1, 3), new Cell(2, 3)]),
            new Sum(7, [ new Cell(2, 1), new Cell(2, 2)]),
            new Sum(13, [ new Cell(3, 1), new Cell(3, 2), new Cell(3, 3)])
        ])).toEqual([
            [ new Set([6, 9]), new Set([2, 8]), new Set([3, 4]), new Set([1, 5, 7]) ],
            [ new Set([6, 9]), new Set([3, 7]), new Set([2, 5]), new Set([1, 4, 8]) ],
            [ new Set([7, 8]), new Set([1, 9]), new Set([2, 5]), new Set([3, 4, 6]) ],
            [ new Set([7, 8]), new Set([1, 9]), new Set([3, 4]), new Set([2, 5, 6]) ],
            [ new Set([7, 8]), new Set([4, 6]), new Set([2, 5]), new Set([1, 3, 9]) ]
        ]);
    });

    test('Single combination of digits to form a complete segment', () => {
        expect(findCombinationsForSegment([
            new Sum(4, [ new Cell(1, 1), new Cell(1, 2)]),
            new Sum(24, [ new Cell(1, 3), new Cell(1, 4), new Cell(1, 5)]),
            new Sum(7, [ new Cell(1, 6), new Cell(1, 7)]),
            new Sum(10, [ new Cell(1, 8), new Cell(1, 9)])
        ])).toEqual([
            [ new Set([1, 3]), new Set([7, 8, 9]), new Set([2, 5]), new Set([4, 6]) ]
        ]);
    });

    test('Combinations of digits to form an incomplete segment', () => {
        expect(findCombinationsForSegment([
            new Sum(4, [ new Cell(1, 1), new Cell(1, 2)]),
            new Sum(9, [ new Cell(1, 6), new Cell(1, 7)])
        ])).toEqual([
            [ new Set([1, 3]), new Set([2, 7]) ],
            [ new Set([1, 3]), new Set([4, 5]) ]
        ]);
    });
});
