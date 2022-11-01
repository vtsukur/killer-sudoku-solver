import _ from 'lodash';
import reader from '../src/reader.js';
import { digitSetsForSum as digitSetsForSum } from '../src/solver';

describe('Solver tests', () => {
    test('Solve full', () => {
        const problem = reader('./problems/1.txt');
    });

    test('Sets of digits to form a sum in 1 cell', () => {
        _.range(1, 9).forEach(sum => {
            expect(digitSetsForSum(sum, 1)).toEqual([ new Set([sum]) ]);
        })
    });

    test('Sets of digits to form a sum in 2 cells', () => {
        _.range(1, 2).forEach(sum => {
            expect(digitSetsForSum(sum, 2)).toEqual([]);
        })
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

    test('Sets of digits to form a sum in 3 cells', () => {
        _.range(1, 5).forEach(sum => {
            expect(digitSetsForSum(sum, 3)).toEqual([]);
        })
        expect(digitSetsForSum(6, 3)).toEqual([ new Set([1, 2, 3]) ]);
        expect(digitSetsForSum(7, 3)).toEqual([ new Set([1, 2, 4]) ]);
        expect(digitSetsForSum(8, 3)).toEqual([ new Set([1, 2, 5]), new Set([1, 3, 4]) ]);
        expect(digitSetsForSum(9, 3)).toEqual(
            [ new Set([1, 2, 6]), new Set([1, 3, 5]), new Set([2, 3, 4]) ]
        );
        expect(digitSetsForSum(10, 3)).toEqual(
            [ new Set([1, 2, 7]), new Set([1, 3, 6]), new Set([1, 4, 5]), new Set([2, 3, 5]) ]
        );
        expect(digitSetsForSum(11, 3)).toEqual(
            [
                new Set([1, 2, 8]), new Set([1, 3, 7]), new Set([1, 4, 6]),
                new Set([2, 3, 6]), new Set([2, 4, 5])
            ]
        );
        expect(digitSetsForSum(12, 3)).toEqual(
            [
                new Set([1, 2, 9]), new Set([1, 3, 8]), new Set([1, 4, 7]), new Set([1, 5, 6]),
                new Set([2, 3, 7]), new Set([2, 4, 6]),
                new Set([3, 4, 5])
            ]
        );
        expect(digitSetsForSum(13, 3)).toEqual(
            [
                new Set([1, 3, 9]), new Set([1, 4, 8]), new Set([1, 5, 7]),
                new Set([2, 3, 8]), new Set([2, 4, 7]), new Set([2, 5, 6]),
                new Set([3, 4, 6])
            ]
        );
        expect(digitSetsForSum(14, 3)).toEqual(
            [
                new Set([1, 4, 9]), new Set([1, 5, 8]), new Set([1, 6, 7]),
                new Set([2, 3, 9]), new Set([2, 4, 8]), new Set([2, 5, 7]),
                new Set([3, 4, 7]), new Set([3, 5, 6])
            ]
        );
        expect(digitSetsForSum(15, 3)).toEqual(
            [
                new Set([1, 5, 9]), new Set([1, 6, 8]),
                new Set([2, 4, 9]), new Set([2, 5, 8]), new Set([2, 6, 7]),
                new Set([3, 4, 8]), new Set([3, 5, 7]),
                new Set([4, 5, 6])
            ]
        );
        expect(digitSetsForSum(16, 3)).toEqual(
            [
                new Set([1, 6, 9]), new Set([1, 7, 8]),
                new Set([2, 5, 9]), new Set([2, 6, 8]),
                new Set([3, 4, 9]), new Set([3, 5, 8]), new Set([3, 6, 7]),
                new Set([4, 5, 7])
            ]
        );
        expect(digitSetsForSum(17, 3)).toEqual(
            [
                new Set([1, 7, 9]),
                new Set([2, 6, 9]), new Set([2, 7, 8]),
                new Set([3, 5, 9]), new Set([3, 6, 8]),
                new Set([4, 5, 8]), new Set([4, 6, 7])
            ]
        );
        expect(digitSetsForSum(18, 3)).toEqual(
            [
                new Set([1, 8, 9]),
                new Set([2, 7, 9]),
                new Set([3, 6, 9]), new Set([3, 7, 8]),
                new Set([4, 5, 9]), new Set([4, 6, 8]),
                new Set([5, 6, 7])
            ]
        );
        expect(digitSetsForSum(19, 3)).toEqual(
            [
                new Set([2, 8, 9]),
                new Set([3, 7, 9]),
                new Set([4, 6, 9]), new Set([4, 7, 8]),
                new Set([5, 6, 8])
            ]
        );
        expect(digitSetsForSum(20, 3)).toEqual(
            [
                new Set([3, 8, 9]),
                new Set([4, 7, 9]),
                new Set([5, 6, 9]), new Set([5, 7, 8])
            ]
        );
        expect(digitSetsForSum(21, 3)).toEqual([ new Set([4, 8, 9]), new Set([5, 7, 9]), new Set([6, 7, 8]) ]);
        expect(digitSetsForSum(22, 3)).toEqual([ new Set([5, 8, 9]), new Set([6, 7, 9]) ]);
        expect(digitSetsForSum(23, 3)).toEqual([ new Set([6, 8, 9]) ]);
        expect(digitSetsForSum(24, 3)).toEqual([ new Set([7, 8, 9]) ]);
        expect(digitSetsForSum(25, 3)).toEqual([]);
    });

    test('Sets of digits to form a sum in 4 cells', () => {
        _.range(1, 9).forEach(sum => {
            expect(digitSetsForSum(sum, 4)).toEqual([]);
        })
        expect(digitSetsForSum(10, 4)).toEqual([ new Set([1, 2, 3, 4]) ]);
        expect(digitSetsForSum(11, 4)).toEqual([ new Set([1, 2, 3, 5]) ]);
        expect(digitSetsForSum(12, 4)).toEqual([ new Set([1, 2, 3, 6]), new Set([1, 2, 4, 5]) ]);
        expect(digitSetsForSum(13, 4)).toEqual(
            [ new Set([1, 2, 3, 7]), new Set([1, 2, 4, 6]), new Set([1, 3, 4, 5]) ]
        );
        expect(digitSetsForSum(14, 4)).toEqual(
            [
                new Set([1, 2, 3, 8]), new Set([1, 2, 4, 7]), new Set([1, 2, 5, 6]),
                new Set([1, 3, 4, 6]),
                new Set([2, 3, 4, 5])
            ]
        );
        expect(digitSetsForSum(15, 4)).toEqual(
            [
                new Set([1, 2, 3, 9]), new Set([1, 2, 4, 8]), new Set([1, 2, 5, 7]),
                new Set([1, 3, 4, 7]), new Set([1, 3, 5, 6]),
                new Set([2, 3, 4, 6])
            ]
        );
        expect(digitSetsForSum(16, 4)).toEqual(
            [
                new Set([1, 2, 4, 9]), new Set([1, 2, 5, 8]), new Set([1, 2, 6, 7]),
                new Set([1, 3, 4, 8]), new Set([1, 3, 5, 7]),
                new Set([1, 4, 5, 6]),
                new Set([2, 3, 4, 7]), new Set([2, 3, 5, 6])
            ]
        );
        expect(digitSetsForSum(17, 4)).toEqual(
            [
                new Set([1, 2, 5, 9]), new Set([1, 2, 6, 8]),
                new Set([1, 3, 4, 9]), new Set([1, 3, 5, 8]), new Set([1, 3, 6, 7]),
                new Set([1, 4, 5, 7]),
                new Set([2, 3, 4, 8]), new Set([2, 3, 5, 7]),
                new Set([2, 4, 5, 6])
            ]
        );
        expect(digitSetsForSum(18, 4)).toEqual(
            [
                new Set([1, 2, 6, 9]), new Set([1, 2, 7, 8]),
                new Set([1, 3, 5, 9]), new Set([1, 3, 6, 8]),
                new Set([1, 4, 5, 8]), new Set([1, 4, 6, 7]),
                new Set([2, 3, 4, 9]), new Set([2, 3, 5, 8]), new Set([2, 3, 6, 7]),
                new Set([2, 4, 5, 7]),
                new Set([3, 4, 5, 6])
            ]
        );
        expect(digitSetsForSum(19, 4)).toEqual(
            [
                new Set([1, 2, 7, 9]),
                new Set([1, 3, 6, 9]), new Set([1, 3, 7, 8]),
                new Set([1, 4, 5, 9]), new Set([1, 4, 6, 8]),
                new Set([1, 5, 6, 7]),
                new Set([2, 3, 5, 9]), new Set([2, 3, 6, 8]),
                new Set([2, 4, 5, 8]), new Set([2, 4, 6, 7]),
                new Set([3, 4, 5, 7])
            ]
        );
        expect(digitSetsForSum(20, 4)).toEqual(
            [
                new Set([1, 2, 8, 9]),
                new Set([1, 3, 7, 9]),
                new Set([1, 4, 6, 9]), new Set([1, 4, 7, 8]),
                new Set([1, 5, 6, 8]),
                new Set([2, 3, 6, 9]), new Set([2, 3, 7, 8]),
                new Set([2, 4, 5, 9]), new Set([2, 4, 6, 8]),
                new Set([2, 5, 6, 7]),
                new Set([3, 4, 5, 8]), new Set([3, 4, 6, 7])
            ]
        );
        expect(digitSetsForSum(21, 4)).toEqual(
            [
                new Set([1, 3, 8, 9]),
                new Set([1, 4, 7, 9]),
                new Set([1, 5, 6, 9]), new Set([1, 5, 7, 8]),
                new Set([2, 3, 7, 9]),
                new Set([2, 4, 6, 9]), new Set([2, 4, 7, 8]),
                new Set([2, 5, 6, 8]),
                new Set([3, 4, 5, 9]), new Set([3, 4, 6, 8]),
                new Set([3, 5, 6, 7])
            ]
        );
        expect(digitSetsForSum(22, 4)).toEqual(
            [
                new Set([1, 4, 8, 9]),
                new Set([1, 5, 7, 9]),
                new Set([1, 6, 7, 8]),
                new Set([2, 3, 8, 9]),
                new Set([2, 4, 7, 9]),
                new Set([2, 5, 6, 9]), new Set([2, 5, 7, 8]),
                new Set([3, 4, 6, 9]), new Set([3, 4, 7, 8]),
                new Set([3, 5, 6, 8]),
                new Set([4, 5, 6, 7])
            ]
        );
        expect(digitSetsForSum(23, 4)).toEqual(
            [
                new Set([1, 5, 8, 9]),
                new Set([1, 6, 7, 9]),
                new Set([2, 4, 8, 9]),
                new Set([2, 5, 7, 9]),
                new Set([2, 6, 7, 8]),
                new Set([3, 4, 7, 9]),
                new Set([3, 5, 6, 9]), new Set([3, 5, 7, 8]),
                new Set([4, 5, 6, 8])
            ]
        );
        expect(digitSetsForSum(24, 4)).toEqual(
            [
                new Set([1, 6, 8, 9]),
                new Set([2, 5, 8, 9]),
                new Set([2, 6, 7, 9]),
                new Set([3, 4, 8, 9]),
                new Set([3, 5, 7, 9]),
                new Set([3, 6, 7, 8]),
                new Set([4, 5, 6, 9]), new Set([4, 5, 7, 8])
            ]
        );
        expect(digitSetsForSum(25, 4)).toEqual(
            [
                new Set([1, 7, 8, 9]),
                new Set([2, 6, 8, 9]),
                new Set([3, 5, 8, 9]),
                new Set([3, 6, 7, 9]),
                new Set([4, 5, 7, 9]),
                new Set([4, 6, 7, 8])
            ]
        );
        expect(digitSetsForSum(26, 4)).toEqual(
            [
                new Set([2, 7, 8, 9]),
                new Set([3, 6, 8, 9]),
                new Set([4, 5, 8, 9]),
                new Set([4, 6, 7, 9]),
                new Set([5, 6, 7, 8])
            ]
        );
        expect(digitSetsForSum(27, 4)).toEqual(
            [
                new Set([3, 7, 8, 9]),
                new Set([4, 6, 8, 9]),
                new Set([5, 6, 7, 9])
            ]
        );
        expect(digitSetsForSum(28, 4)).toEqual([ new Set([4, 7, 8, 9]), new Set([5, 6, 8, 9]) ]);
        expect(digitSetsForSum(29, 4)).toEqual([ new Set([5, 7, 8, 9]) ]);
        expect(digitSetsForSum(30, 4)).toEqual([ new Set([6, 7, 8, 9]) ]);
        expect(digitSetsForSum(31, 4)).toEqual([]);
    });

    test('Sets of digits to form a sum in 5 cells (shallow coverage)', () => {
        _.range(1, 14).forEach(sum => {
            expect(digitSetsForSum(sum, 5)).toEqual([]);
        })
        expect(digitSetsForSum(15, 5)).toEqual([ new Set([1, 2, 3, 4, 5]) ]);
        expect(digitSetsForSum(30, 5)).toEqual(
            [
                new Set([1, 5, 7, 8, 9]),
                new Set([2, 4, 7, 8, 9]),
                new Set([2, 5, 6, 8, 9]),
                new Set([3, 4, 6, 8, 9]),
                new Set([3, 5, 6, 7, 9]),
                new Set([4, 5, 6, 7, 8])
            ]
        );
        expect(digitSetsForSum(35, 5)).toEqual([ new Set([5, 6, 7, 8, 9]) ]);
        expect(digitSetsForSum(36, 5)).toEqual([]);
    });

    test('Sets of digits to form a sum in 6 cells (shallow coverage)', () => {
        _.range(1, 20).forEach(sum => {
            expect(digitSetsForSum(sum, 6)).toEqual([]);
        })
        expect(digitSetsForSum(21, 6)).toEqual([ new Set([1, 2, 3, 4, 5, 6]) ]);
        expect(digitSetsForSum(30, 6)).toEqual(
            [
                new Set([1, 2, 3, 7, 8, 9]),
                new Set([1, 2, 4, 6, 8, 9]),
                new Set([1, 2, 5, 6, 7, 9]),
                new Set([1, 3, 4, 5, 8, 9]),
                new Set([1, 3, 4, 6, 7, 9]),
                new Set([1, 3, 5, 6, 7, 8]),
                new Set([2, 3, 4, 5, 7, 9]),
                new Set([2, 3, 4, 6, 7, 8])
            ]
        );
        expect(digitSetsForSum(39, 6)).toEqual([ new Set([4, 5, 6, 7, 8, 9]) ]);
        expect(digitSetsForSum(40, 6)).toEqual([]);
    });

    test('Sets of digits to form a sum in 7 cells (shallow coverage)', () => {
        expect(digitSetsForSum(27, 7)).toEqual([]);
        expect(digitSetsForSum(28, 7)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7]) ]);
        expect(digitSetsForSum(36, 7)).toEqual(
            [
                new Set([1, 2, 3, 6, 7, 8, 9]),
                new Set([1, 2, 4, 5, 7, 8, 9]),
                new Set([1, 3, 4, 5, 6, 8, 9]),
                new Set([2, 3, 4, 5, 6, 7, 9])
            ]
        );
        expect(digitSetsForSum(42, 7)).toEqual([ new Set([3, 4, 5, 6, 7, 8, 9]) ]);
        expect(digitSetsForSum(43, 7)).toEqual([]);
    });

    test('Sets of digits to form a sum in 8 cells (shallow coverage)', () => {
        expect(digitSetsForSum(35, 8)).toEqual([]);
        expect(digitSetsForSum(36, 8)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8]) ]);
        expect(digitSetsForSum(40, 8)).toEqual([ new Set([1, 2, 3, 4, 6, 7, 8, 9]) ]);
        expect(digitSetsForSum(44, 8)).toEqual([ new Set([2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(digitSetsForSum(45, 8)).toEqual([]);
    });

    test('Sets of digits to form a sum in 9 cells', () => {
        expect(digitSetsForSum(44, 9)).toEqual([]);
        expect(digitSetsForSum(45, 9)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(digitSetsForSum(46, 9)).toEqual([]);
    });
});
