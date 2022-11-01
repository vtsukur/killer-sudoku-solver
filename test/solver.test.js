import _ from 'lodash';
import reader from '../src/reader.js';
import { digitSetsForSum as digitSetsForSum } from '../src/solver';

describe('Solver tests', () => {
    test('Solve full', () => {
        const problem = reader('./problems/1.txt');
    });

    test('Digit sets for a sum within 1 cell', () => {
        _.range(1, 9).forEach(digit => {
            expect(digitSetsForSum(digit, 1)).toEqual([ new Set([digit]) ]);
        })
    });

    test('Digits sets for a sum within 2 cells', () => {
        expect(digitSetsForSum(1, 2)).toEqual([]);
        expect(digitSetsForSum(2, 2)).toEqual([]);
        expect(digitSetsForSum(3, 2)).toEqual([ new Set([1, 2]) ]);
        expect(digitSetsForSum(4, 2)).toEqual([ new Set([1, 3]) ]);
        expect(digitSetsForSum(5, 2)).toEqual([ new Set([1, 4]), new Set([2, 3]) ]);
        expect(digitSetsForSum(6, 2)).toEqual([ new Set([1, 5]), new Set([2, 4]) ]);
        expect(digitSetsForSum(7, 2)).toEqual(
            [ new Set([1, 6]), new Set([2, 5]), new Set([3, 4]) ]
        );
        expect(digitSetsForSum(8, 2)).toEqual(
            [ new Set([1, 7]), new Set([2, 6]), new Set([3, 5]) ]
        );
        expect(digitSetsForSum(9, 2)).toEqual(
            [ new Set([1, 8]), new Set([2, 7]), new Set([3, 6]), new Set([4, 5]) ]
        );
        expect(digitSetsForSum(10, 2)).toEqual(
            [ new Set([1, 9]), new Set([2, 8]), new Set([3, 7]), new Set([4, 6]) ]
        );
        expect(digitSetsForSum(11, 2)).toEqual(
            [ new Set([2, 9]), new Set([3, 8]), new Set([4, 7]), new Set([5, 6]) ]
        );
        expect(digitSetsForSum(12, 2)).toEqual(
            [ new Set([3, 9]), new Set([4, 8]), new Set([5, 7]) ]
        );
        expect(digitSetsForSum(13, 2)).toEqual(
            [ new Set([4, 9]), new Set([5, 8]), new Set([6, 7]) ]
        );
        expect(digitSetsForSum(14, 2)).toEqual([ new Set([5, 9]), new Set([6, 8]) ]);
        expect(digitSetsForSum(15, 2)).toEqual([ new Set([6, 9]), new Set([7, 8]) ]);
        expect(digitSetsForSum(16, 2)).toEqual([ new Set([7, 9]) ]);
        expect(digitSetsForSum(17, 2)).toEqual([ new Set([8, 9]) ]);
        expect(digitSetsForSum(18, 2)).toEqual([]);
    });
});
