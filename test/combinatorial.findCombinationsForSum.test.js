import _ from 'lodash';
import { findCombinationsForSum } from '../src/combinatorial';

describe('Tests for the finder of digit combinations to form a sum', () => {
    test('Digit combinations to form a sum in 1 cell', () => {
        _.range(1, 9).forEach(sum => {
            expect(findCombinationsForSum(sum, 1)).toEqual([ new Set([sum]) ]);
        })
    });

    test('Digit combinations to form a sum in 2 cells', () => {
        _.range(1, 2).forEach(sum => {
            expect(findCombinationsForSum(sum, 2)).toEqual([]);
        })
        expect(findCombinationsForSum(3, 2)).toEqual([ new Set([1, 2]) ]);
        expect(findCombinationsForSum(4, 2)).toEqual([ new Set([1, 3]) ]);
        expect(findCombinationsForSum(5, 2)).toEqual([ new Set([1, 4]), new Set([2, 3]) ]);
        expect(findCombinationsForSum(6, 2)).toEqual([ new Set([1, 5]), new Set([2, 4]) ]);
        expect(findCombinationsForSum(7, 2)).toEqual(
            [ new Set([1, 6]), new Set([2, 5]), new Set([3, 4]) ]
        );
        expect(findCombinationsForSum(8, 2)).toEqual(
            [ new Set([1, 7]), new Set([2, 6]), new Set([3, 5]) ]
        );
        expect(findCombinationsForSum(9, 2)).toEqual(
            [ new Set([1, 8]), new Set([2, 7]), new Set([3, 6]), new Set([4, 5]) ]
        );
        expect(findCombinationsForSum(10, 2)).toEqual(
            [ new Set([1, 9]), new Set([2, 8]), new Set([3, 7]), new Set([4, 6]) ]
        );
        expect(findCombinationsForSum(11, 2)).toEqual(
            [ new Set([2, 9]), new Set([3, 8]), new Set([4, 7]), new Set([5, 6]) ]
        );
        expect(findCombinationsForSum(12, 2)).toEqual(
            [ new Set([3, 9]), new Set([4, 8]), new Set([5, 7]) ]
        );
        expect(findCombinationsForSum(13, 2)).toEqual(
            [ new Set([4, 9]), new Set([5, 8]), new Set([6, 7]) ]
        );
        expect(findCombinationsForSum(14, 2)).toEqual([ new Set([5, 9]), new Set([6, 8]) ]);
        expect(findCombinationsForSum(15, 2)).toEqual([ new Set([6, 9]), new Set([7, 8]) ]);
        expect(findCombinationsForSum(16, 2)).toEqual([ new Set([7, 9]) ]);
        expect(findCombinationsForSum(17, 2)).toEqual([ new Set([8, 9]) ]);
        expect(findCombinationsForSum(18, 2)).toEqual([]);
    });

    test('Digit combinations to form a sum in 3 cells', () => {
        _.range(1, 5).forEach(sum => {
            expect(findCombinationsForSum(sum, 3)).toEqual([]);
        })
        expect(findCombinationsForSum(6, 3)).toEqual([ new Set([1, 2, 3]) ]);
        expect(findCombinationsForSum(7, 3)).toEqual([ new Set([1, 2, 4]) ]);
        expect(findCombinationsForSum(8, 3)).toEqual([ new Set([1, 2, 5]), new Set([1, 3, 4]) ]);
        expect(findCombinationsForSum(9, 3)).toEqual(
            [ new Set([1, 2, 6]), new Set([1, 3, 5]), new Set([2, 3, 4]) ]
        );
        expect(findCombinationsForSum(10, 3)).toEqual(
            [ new Set([1, 2, 7]), new Set([1, 3, 6]), new Set([1, 4, 5]), new Set([2, 3, 5]) ]
        );
        expect(findCombinationsForSum(11, 3)).toEqual(
            [
                new Set([1, 2, 8]), new Set([1, 3, 7]), new Set([1, 4, 6]),
                new Set([2, 3, 6]), new Set([2, 4, 5])
            ]
        );
        expect(findCombinationsForSum(12, 3)).toEqual(
            [
                new Set([1, 2, 9]), new Set([1, 3, 8]), new Set([1, 4, 7]), new Set([1, 5, 6]),
                new Set([2, 3, 7]), new Set([2, 4, 6]),
                new Set([3, 4, 5])
            ]
        );
        expect(findCombinationsForSum(13, 3)).toEqual(
            [
                new Set([1, 3, 9]), new Set([1, 4, 8]), new Set([1, 5, 7]),
                new Set([2, 3, 8]), new Set([2, 4, 7]), new Set([2, 5, 6]),
                new Set([3, 4, 6])
            ]
        );
        expect(findCombinationsForSum(14, 3)).toEqual(
            [
                new Set([1, 4, 9]), new Set([1, 5, 8]), new Set([1, 6, 7]),
                new Set([2, 3, 9]), new Set([2, 4, 8]), new Set([2, 5, 7]),
                new Set([3, 4, 7]), new Set([3, 5, 6])
            ]
        );
        expect(findCombinationsForSum(15, 3)).toEqual(
            [
                new Set([1, 5, 9]), new Set([1, 6, 8]),
                new Set([2, 4, 9]), new Set([2, 5, 8]), new Set([2, 6, 7]),
                new Set([3, 4, 8]), new Set([3, 5, 7]),
                new Set([4, 5, 6])
            ]
        );
        expect(findCombinationsForSum(16, 3)).toEqual(
            [
                new Set([1, 6, 9]), new Set([1, 7, 8]),
                new Set([2, 5, 9]), new Set([2, 6, 8]),
                new Set([3, 4, 9]), new Set([3, 5, 8]), new Set([3, 6, 7]),
                new Set([4, 5, 7])
            ]
        );
        expect(findCombinationsForSum(17, 3)).toEqual(
            [
                new Set([1, 7, 9]),
                new Set([2, 6, 9]), new Set([2, 7, 8]),
                new Set([3, 5, 9]), new Set([3, 6, 8]),
                new Set([4, 5, 8]), new Set([4, 6, 7])
            ]
        );
        expect(findCombinationsForSum(18, 3)).toEqual(
            [
                new Set([1, 8, 9]),
                new Set([2, 7, 9]),
                new Set([3, 6, 9]), new Set([3, 7, 8]),
                new Set([4, 5, 9]), new Set([4, 6, 8]),
                new Set([5, 6, 7])
            ]
        );
        expect(findCombinationsForSum(19, 3)).toEqual(
            [
                new Set([2, 8, 9]),
                new Set([3, 7, 9]),
                new Set([4, 6, 9]), new Set([4, 7, 8]),
                new Set([5, 6, 8])
            ]
        );
        expect(findCombinationsForSum(20, 3)).toEqual(
            [
                new Set([3, 8, 9]),
                new Set([4, 7, 9]),
                new Set([5, 6, 9]), new Set([5, 7, 8])
            ]
        );
        expect(findCombinationsForSum(21, 3)).toEqual([ new Set([4, 8, 9]), new Set([5, 7, 9]), new Set([6, 7, 8]) ]);
        expect(findCombinationsForSum(22, 3)).toEqual([ new Set([5, 8, 9]), new Set([6, 7, 9]) ]);
        expect(findCombinationsForSum(23, 3)).toEqual([ new Set([6, 8, 9]) ]);
        expect(findCombinationsForSum(24, 3)).toEqual([ new Set([7, 8, 9]) ]);
        expect(findCombinationsForSum(25, 3)).toEqual([]);
    });

    test('Digit combinations to form a sum in 4 cells', () => {
        _.range(1, 9).forEach(sum => {
            expect(findCombinationsForSum(sum, 4)).toEqual([]);
        })
        expect(findCombinationsForSum(10, 4)).toEqual([ new Set([1, 2, 3, 4]) ]);
        expect(findCombinationsForSum(11, 4)).toEqual([ new Set([1, 2, 3, 5]) ]);
        expect(findCombinationsForSum(12, 4)).toEqual([ new Set([1, 2, 3, 6]), new Set([1, 2, 4, 5]) ]);
        expect(findCombinationsForSum(13, 4)).toEqual(
            [ new Set([1, 2, 3, 7]), new Set([1, 2, 4, 6]), new Set([1, 3, 4, 5]) ]
        );
        expect(findCombinationsForSum(14, 4)).toEqual(
            [
                new Set([1, 2, 3, 8]), new Set([1, 2, 4, 7]), new Set([1, 2, 5, 6]),
                new Set([1, 3, 4, 6]),
                new Set([2, 3, 4, 5])
            ]
        );
        expect(findCombinationsForSum(15, 4)).toEqual(
            [
                new Set([1, 2, 3, 9]), new Set([1, 2, 4, 8]), new Set([1, 2, 5, 7]),
                new Set([1, 3, 4, 7]), new Set([1, 3, 5, 6]),
                new Set([2, 3, 4, 6])
            ]
        );
        expect(findCombinationsForSum(16, 4)).toEqual(
            [
                new Set([1, 2, 4, 9]), new Set([1, 2, 5, 8]), new Set([1, 2, 6, 7]),
                new Set([1, 3, 4, 8]), new Set([1, 3, 5, 7]),
                new Set([1, 4, 5, 6]),
                new Set([2, 3, 4, 7]), new Set([2, 3, 5, 6])
            ]
        );
        expect(findCombinationsForSum(17, 4)).toEqual(
            [
                new Set([1, 2, 5, 9]), new Set([1, 2, 6, 8]),
                new Set([1, 3, 4, 9]), new Set([1, 3, 5, 8]), new Set([1, 3, 6, 7]),
                new Set([1, 4, 5, 7]),
                new Set([2, 3, 4, 8]), new Set([2, 3, 5, 7]),
                new Set([2, 4, 5, 6])
            ]
        );
        expect(findCombinationsForSum(18, 4)).toEqual(
            [
                new Set([1, 2, 6, 9]), new Set([1, 2, 7, 8]),
                new Set([1, 3, 5, 9]), new Set([1, 3, 6, 8]),
                new Set([1, 4, 5, 8]), new Set([1, 4, 6, 7]),
                new Set([2, 3, 4, 9]), new Set([2, 3, 5, 8]), new Set([2, 3, 6, 7]),
                new Set([2, 4, 5, 7]),
                new Set([3, 4, 5, 6])
            ]
        );
        expect(findCombinationsForSum(19, 4)).toEqual(
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
        expect(findCombinationsForSum(20, 4)).toEqual(
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
        expect(findCombinationsForSum(21, 4)).toEqual(
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
        expect(findCombinationsForSum(22, 4)).toEqual(
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
        expect(findCombinationsForSum(23, 4)).toEqual(
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
        expect(findCombinationsForSum(24, 4)).toEqual(
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
        expect(findCombinationsForSum(25, 4)).toEqual(
            [
                new Set([1, 7, 8, 9]),
                new Set([2, 6, 8, 9]),
                new Set([3, 5, 8, 9]),
                new Set([3, 6, 7, 9]),
                new Set([4, 5, 7, 9]),
                new Set([4, 6, 7, 8])
            ]
        );
        expect(findCombinationsForSum(26, 4)).toEqual(
            [
                new Set([2, 7, 8, 9]),
                new Set([3, 6, 8, 9]),
                new Set([4, 5, 8, 9]),
                new Set([4, 6, 7, 9]),
                new Set([5, 6, 7, 8])
            ]
        );
        expect(findCombinationsForSum(27, 4)).toEqual(
            [
                new Set([3, 7, 8, 9]),
                new Set([4, 6, 8, 9]),
                new Set([5, 6, 7, 9])
            ]
        );
        expect(findCombinationsForSum(28, 4)).toEqual([ new Set([4, 7, 8, 9]), new Set([5, 6, 8, 9]) ]);
        expect(findCombinationsForSum(29, 4)).toEqual([ new Set([5, 7, 8, 9]) ]);
        expect(findCombinationsForSum(30, 4)).toEqual([ new Set([6, 7, 8, 9]) ]);
        expect(findCombinationsForSum(31, 4)).toEqual([]);
    });

    test('Digit combinations to form a sum in 5 cells (shallow coverage)', () => {
        _.range(1, 14).forEach(sum => {
            expect(findCombinationsForSum(sum, 5)).toEqual([]);
        })
        expect(findCombinationsForSum(15, 5)).toEqual([ new Set([1, 2, 3, 4, 5]) ]);
        expect(findCombinationsForSum(30, 5)).toEqual(
            [
                new Set([1, 5, 7, 8, 9]),
                new Set([2, 4, 7, 8, 9]),
                new Set([2, 5, 6, 8, 9]),
                new Set([3, 4, 6, 8, 9]),
                new Set([3, 5, 6, 7, 9]),
                new Set([4, 5, 6, 7, 8])
            ]
        );
        expect(findCombinationsForSum(35, 5)).toEqual([ new Set([5, 6, 7, 8, 9]) ]);
        expect(findCombinationsForSum(36, 5)).toEqual([]);
    });

    test('Digit combinations to form a sum in 6 cells (shallow coverage)', () => {
        _.range(1, 20).forEach(sum => {
            expect(findCombinationsForSum(sum, 6)).toEqual([]);
        })
        expect(findCombinationsForSum(21, 6)).toEqual([ new Set([1, 2, 3, 4, 5, 6]) ]);
        expect(findCombinationsForSum(30, 6)).toEqual(
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
        expect(findCombinationsForSum(39, 6)).toEqual([ new Set([4, 5, 6, 7, 8, 9]) ]);
        expect(findCombinationsForSum(40, 6)).toEqual([]);
    });

    test('Digit combinations to form a sum in 7 cells (shallow coverage)', () => {
        expect(findCombinationsForSum(27, 7)).toEqual([]);
        expect(findCombinationsForSum(28, 7)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7]) ]);
        expect(findCombinationsForSum(36, 7)).toEqual(
            [
                new Set([1, 2, 3, 6, 7, 8, 9]),
                new Set([1, 2, 4, 5, 7, 8, 9]),
                new Set([1, 3, 4, 5, 6, 8, 9]),
                new Set([2, 3, 4, 5, 6, 7, 9])
            ]
        );
        expect(findCombinationsForSum(42, 7)).toEqual([ new Set([3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findCombinationsForSum(43, 7)).toEqual([]);
    });

    test('Digit combinations to form a sum in 8 cells (shallow coverage)', () => {
        expect(findCombinationsForSum(35, 8)).toEqual([]);
        expect(findCombinationsForSum(36, 8)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8]) ]);
        expect(findCombinationsForSum(40, 8)).toEqual([ new Set([1, 2, 3, 4, 6, 7, 8, 9]) ]);
        expect(findCombinationsForSum(44, 8)).toEqual([ new Set([2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findCombinationsForSum(45, 8)).toEqual([]);
    });

    test('Digit combinations to form a sum in 9 cells', () => {
        expect(findCombinationsForSum(44, 9)).toEqual([]);
        expect(findCombinationsForSum(45, 9)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findCombinationsForSum(46, 9)).toEqual([]);
    });

    test('Invalid sum', () => {
        expect(() => findCombinationsForSum(0, 2)).toThrow('Invalid sum: 0');
        expect(() => findCombinationsForSum(-1, 2)).toThrow('Invalid sum: -1');
        expect(() => findCombinationsForSum("3", 2)).toThrow('Invalid sum: 3');
        expect(() => findCombinationsForSum({}, 2)).toThrow('Invalid sum: [object Object]');
        expect(() => findCombinationsForSum(undefined, 2)).toThrow('Invalid sum: undefined');
        expect(() => findCombinationsForSum(null, 2)).toThrow('Invalid sum: null');
    });

    test('Invalid count', () => {
        expect(() => findCombinationsForSum(3, 0)).toThrow('Invalid count: 0');
        expect(() => findCombinationsForSum(3, -1)).toThrow('Invalid count: -1');
        expect(() => findCombinationsForSum(3, "2")).toThrow('Invalid count: 2');
        expect(() => findCombinationsForSum(3, {})).toThrow('Invalid count: [object Object]');
        expect(() => findCombinationsForSum(3, null)).toThrow('Invalid count: null');
        expect(() => findCombinationsForSum(3, undefined)).toThrow('Invalid count: undefined');
    });
});
