import _ from 'lodash';
import { findNumCombinationsForSum } from '../../src/solver/combinatorial/index';

describe('Tests for the finder of number combinations to form a cage', () => {
    test('Num combinations to form a cage in 1 cell', () => {
        _.range(1, 10).forEach(cage => {
            expect(findNumCombinationsForSum(cage, 1)).toEqual([ new Set([cage]) ]);
        })
    });

    test('Num combinations to form a cage in 2 cells', () => {
        _.range(1, 3).forEach(cage => {
            expect(findNumCombinationsForSum(cage, 2)).toEqual([]);
        })
        expect(findNumCombinationsForSum(3, 2)).toEqual([ new Set([1, 2]) ]);
        expect(findNumCombinationsForSum(4, 2)).toEqual([ new Set([1, 3]) ]);
        expect(findNumCombinationsForSum(5, 2)).toEqual([ new Set([1, 4]), new Set([2, 3]) ]);
        expect(findNumCombinationsForSum(6, 2)).toEqual([ new Set([1, 5]), new Set([2, 4]) ]);
        expect(findNumCombinationsForSum(7, 2)).toEqual(
            [ new Set([1, 6]), new Set([2, 5]), new Set([3, 4]) ]
        );
        expect(findNumCombinationsForSum(8, 2)).toEqual(
            [ new Set([1, 7]), new Set([2, 6]), new Set([3, 5]) ]
        );
        expect(findNumCombinationsForSum(9, 2)).toEqual(
            [ new Set([1, 8]), new Set([2, 7]), new Set([3, 6]), new Set([4, 5]) ]
        );
        expect(findNumCombinationsForSum(10, 2)).toEqual(
            [ new Set([1, 9]), new Set([2, 8]), new Set([3, 7]), new Set([4, 6]) ]
        );
        expect(findNumCombinationsForSum(11, 2)).toEqual(
            [ new Set([2, 9]), new Set([3, 8]), new Set([4, 7]), new Set([5, 6]) ]
        );
        expect(findNumCombinationsForSum(12, 2)).toEqual(
            [ new Set([3, 9]), new Set([4, 8]), new Set([5, 7]) ]
        );
        expect(findNumCombinationsForSum(13, 2)).toEqual(
            [ new Set([4, 9]), new Set([5, 8]), new Set([6, 7]) ]
        );
        expect(findNumCombinationsForSum(14, 2)).toEqual([ new Set([5, 9]), new Set([6, 8]) ]);
        expect(findNumCombinationsForSum(15, 2)).toEqual([ new Set([6, 9]), new Set([7, 8]) ]);
        expect(findNumCombinationsForSum(16, 2)).toEqual([ new Set([7, 9]) ]);
        expect(findNumCombinationsForSum(17, 2)).toEqual([ new Set([8, 9]) ]);
        expect(findNumCombinationsForSum(18, 2)).toEqual([]);
    });

    test('Num combinations to form a cage in 3 cells', () => {
        _.range(1, 6).forEach(cage => {
            expect(findNumCombinationsForSum(cage, 3)).toEqual([]);
        })
        expect(findNumCombinationsForSum(6, 3)).toEqual([ new Set([1, 2, 3]) ]);
        expect(findNumCombinationsForSum(7, 3)).toEqual([ new Set([1, 2, 4]) ]);
        expect(findNumCombinationsForSum(8, 3)).toEqual([ new Set([1, 2, 5]), new Set([1, 3, 4]) ]);
        expect(findNumCombinationsForSum(9, 3)).toEqual(
            [ new Set([1, 2, 6]), new Set([1, 3, 5]), new Set([2, 3, 4]) ]
        );
        expect(findNumCombinationsForSum(10, 3)).toEqual(
            [ new Set([1, 2, 7]), new Set([1, 3, 6]), new Set([1, 4, 5]), new Set([2, 3, 5]) ]
        );
        expect(findNumCombinationsForSum(11, 3)).toEqual(
            [
                new Set([1, 2, 8]), new Set([1, 3, 7]), new Set([1, 4, 6]),
                new Set([2, 3, 6]), new Set([2, 4, 5])
            ]
        );
        expect(findNumCombinationsForSum(12, 3)).toEqual(
            [
                new Set([1, 2, 9]), new Set([1, 3, 8]), new Set([1, 4, 7]), new Set([1, 5, 6]),
                new Set([2, 3, 7]), new Set([2, 4, 6]),
                new Set([3, 4, 5])
            ]
        );
        expect(findNumCombinationsForSum(13, 3)).toEqual(
            [
                new Set([1, 3, 9]), new Set([1, 4, 8]), new Set([1, 5, 7]),
                new Set([2, 3, 8]), new Set([2, 4, 7]), new Set([2, 5, 6]),
                new Set([3, 4, 6])
            ]
        );
        expect(findNumCombinationsForSum(14, 3)).toEqual(
            [
                new Set([1, 4, 9]), new Set([1, 5, 8]), new Set([1, 6, 7]),
                new Set([2, 3, 9]), new Set([2, 4, 8]), new Set([2, 5, 7]),
                new Set([3, 4, 7]), new Set([3, 5, 6])
            ]
        );
        expect(findNumCombinationsForSum(15, 3)).toEqual(
            [
                new Set([1, 5, 9]), new Set([1, 6, 8]),
                new Set([2, 4, 9]), new Set([2, 5, 8]), new Set([2, 6, 7]),
                new Set([3, 4, 8]), new Set([3, 5, 7]),
                new Set([4, 5, 6])
            ]
        );
        expect(findNumCombinationsForSum(16, 3)).toEqual(
            [
                new Set([1, 6, 9]), new Set([1, 7, 8]),
                new Set([2, 5, 9]), new Set([2, 6, 8]),
                new Set([3, 4, 9]), new Set([3, 5, 8]), new Set([3, 6, 7]),
                new Set([4, 5, 7])
            ]
        );
        expect(findNumCombinationsForSum(17, 3)).toEqual(
            [
                new Set([1, 7, 9]),
                new Set([2, 6, 9]), new Set([2, 7, 8]),
                new Set([3, 5, 9]), new Set([3, 6, 8]),
                new Set([4, 5, 8]), new Set([4, 6, 7])
            ]
        );
        expect(findNumCombinationsForSum(18, 3)).toEqual(
            [
                new Set([1, 8, 9]),
                new Set([2, 7, 9]),
                new Set([3, 6, 9]), new Set([3, 7, 8]),
                new Set([4, 5, 9]), new Set([4, 6, 8]),
                new Set([5, 6, 7])
            ]
        );
        expect(findNumCombinationsForSum(19, 3)).toEqual(
            [
                new Set([2, 8, 9]),
                new Set([3, 7, 9]),
                new Set([4, 6, 9]), new Set([4, 7, 8]),
                new Set([5, 6, 8])
            ]
        );
        expect(findNumCombinationsForSum(20, 3)).toEqual(
            [
                new Set([3, 8, 9]),
                new Set([4, 7, 9]),
                new Set([5, 6, 9]), new Set([5, 7, 8])
            ]
        );
        expect(findNumCombinationsForSum(21, 3)).toEqual([ new Set([4, 8, 9]), new Set([5, 7, 9]), new Set([6, 7, 8]) ]);
        expect(findNumCombinationsForSum(22, 3)).toEqual([ new Set([5, 8, 9]), new Set([6, 7, 9]) ]);
        expect(findNumCombinationsForSum(23, 3)).toEqual([ new Set([6, 8, 9]) ]);
        expect(findNumCombinationsForSum(24, 3)).toEqual([ new Set([7, 8, 9]) ]);
        expect(findNumCombinationsForSum(25, 3)).toEqual([]);
    });

    test('Num combinations to form a cage in 4 cells', () => {
        _.range(1, 10).forEach(cage => {
            expect(findNumCombinationsForSum(cage, 4)).toEqual([]);
        })
        expect(findNumCombinationsForSum(10, 4)).toEqual([ new Set([1, 2, 3, 4]) ]);
        expect(findNumCombinationsForSum(11, 4)).toEqual([ new Set([1, 2, 3, 5]) ]);
        expect(findNumCombinationsForSum(12, 4)).toEqual([ new Set([1, 2, 3, 6]), new Set([1, 2, 4, 5]) ]);
        expect(findNumCombinationsForSum(13, 4)).toEqual(
            [ new Set([1, 2, 3, 7]), new Set([1, 2, 4, 6]), new Set([1, 3, 4, 5]) ]
        );
        expect(findNumCombinationsForSum(14, 4)).toEqual(
            [
                new Set([1, 2, 3, 8]), new Set([1, 2, 4, 7]), new Set([1, 2, 5, 6]),
                new Set([1, 3, 4, 6]),
                new Set([2, 3, 4, 5])
            ]
        );
        expect(findNumCombinationsForSum(15, 4)).toEqual(
            [
                new Set([1, 2, 3, 9]), new Set([1, 2, 4, 8]), new Set([1, 2, 5, 7]),
                new Set([1, 3, 4, 7]), new Set([1, 3, 5, 6]),
                new Set([2, 3, 4, 6])
            ]
        );
        expect(findNumCombinationsForSum(16, 4)).toEqual(
            [
                new Set([1, 2, 4, 9]), new Set([1, 2, 5, 8]), new Set([1, 2, 6, 7]),
                new Set([1, 3, 4, 8]), new Set([1, 3, 5, 7]),
                new Set([1, 4, 5, 6]),
                new Set([2, 3, 4, 7]), new Set([2, 3, 5, 6])
            ]
        );
        expect(findNumCombinationsForSum(17, 4)).toEqual(
            [
                new Set([1, 2, 5, 9]), new Set([1, 2, 6, 8]),
                new Set([1, 3, 4, 9]), new Set([1, 3, 5, 8]), new Set([1, 3, 6, 7]),
                new Set([1, 4, 5, 7]),
                new Set([2, 3, 4, 8]), new Set([2, 3, 5, 7]),
                new Set([2, 4, 5, 6])
            ]
        );
        expect(findNumCombinationsForSum(18, 4)).toEqual(
            [
                new Set([1, 2, 6, 9]), new Set([1, 2, 7, 8]),
                new Set([1, 3, 5, 9]), new Set([1, 3, 6, 8]),
                new Set([1, 4, 5, 8]), new Set([1, 4, 6, 7]),
                new Set([2, 3, 4, 9]), new Set([2, 3, 5, 8]), new Set([2, 3, 6, 7]),
                new Set([2, 4, 5, 7]),
                new Set([3, 4, 5, 6])
            ]
        );
        expect(findNumCombinationsForSum(19, 4)).toEqual(
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
        expect(findNumCombinationsForSum(20, 4)).toEqual(
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
        expect(findNumCombinationsForSum(21, 4)).toEqual(
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
        expect(findNumCombinationsForSum(22, 4)).toEqual(
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
        expect(findNumCombinationsForSum(23, 4)).toEqual(
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
        expect(findNumCombinationsForSum(24, 4)).toEqual(
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
        expect(findNumCombinationsForSum(25, 4)).toEqual(
            [
                new Set([1, 7, 8, 9]),
                new Set([2, 6, 8, 9]),
                new Set([3, 5, 8, 9]),
                new Set([3, 6, 7, 9]),
                new Set([4, 5, 7, 9]),
                new Set([4, 6, 7, 8])
            ]
        );
        expect(findNumCombinationsForSum(26, 4)).toEqual(
            [
                new Set([2, 7, 8, 9]),
                new Set([3, 6, 8, 9]),
                new Set([4, 5, 8, 9]),
                new Set([4, 6, 7, 9]),
                new Set([5, 6, 7, 8])
            ]
        );
        expect(findNumCombinationsForSum(27, 4)).toEqual(
            [
                new Set([3, 7, 8, 9]),
                new Set([4, 6, 8, 9]),
                new Set([5, 6, 7, 9])
            ]
        );
        expect(findNumCombinationsForSum(28, 4)).toEqual([ new Set([4, 7, 8, 9]), new Set([5, 6, 8, 9]) ]);
        expect(findNumCombinationsForSum(29, 4)).toEqual([ new Set([5, 7, 8, 9]) ]);
        expect(findNumCombinationsForSum(30, 4)).toEqual([ new Set([6, 7, 8, 9]) ]);
        expect(findNumCombinationsForSum(31, 4)).toEqual([]);
    });

    test('Num combinations to form a cage in 5 cells (shallow coverage)', () => {
        _.range(1, 15).forEach(cage => {
            expect(findNumCombinationsForSum(cage, 5)).toEqual([]);
        })
        expect(findNumCombinationsForSum(15, 5)).toEqual([ new Set([1, 2, 3, 4, 5]) ]);
        expect(findNumCombinationsForSum(30, 5)).toEqual(
            [
                new Set([1, 5, 7, 8, 9]),
                new Set([2, 4, 7, 8, 9]),
                new Set([2, 5, 6, 8, 9]),
                new Set([3, 4, 6, 8, 9]),
                new Set([3, 5, 6, 7, 9]),
                new Set([4, 5, 6, 7, 8])
            ]
        );
        expect(findNumCombinationsForSum(35, 5)).toEqual([ new Set([5, 6, 7, 8, 9]) ]);
        expect(findNumCombinationsForSum(36, 5)).toEqual([]);
    });

    test('Num combinations to form a cage in 6 cells (shallow coverage)', () => {
        _.range(1, 21).forEach(cage => {
            expect(findNumCombinationsForSum(cage, 6)).toEqual([]);
        })
        expect(findNumCombinationsForSum(21, 6)).toEqual([ new Set([1, 2, 3, 4, 5, 6]) ]);
        expect(findNumCombinationsForSum(30, 6)).toEqual(
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
        expect(findNumCombinationsForSum(39, 6)).toEqual([ new Set([4, 5, 6, 7, 8, 9]) ]);
        expect(findNumCombinationsForSum(40, 6)).toEqual([]);
    });

    test('Num combinations to form a cage in 7 cells (shallow coverage)', () => {
        expect(findNumCombinationsForSum(27, 7)).toEqual([]);
        expect(findNumCombinationsForSum(28, 7)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7]) ]);
        expect(findNumCombinationsForSum(36, 7)).toEqual(
            [
                new Set([1, 2, 3, 6, 7, 8, 9]),
                new Set([1, 2, 4, 5, 7, 8, 9]),
                new Set([1, 3, 4, 5, 6, 8, 9]),
                new Set([2, 3, 4, 5, 6, 7, 9])
            ]
        );
        expect(findNumCombinationsForSum(42, 7)).toEqual([ new Set([3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findNumCombinationsForSum(43, 7)).toEqual([]);
    });

    test('Num combinations to form a cage in 8 cells (shallow coverage)', () => {
        expect(findNumCombinationsForSum(35, 8)).toEqual([]);
        expect(findNumCombinationsForSum(36, 8)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8]) ]);
        expect(findNumCombinationsForSum(40, 8)).toEqual([ new Set([1, 2, 3, 4, 6, 7, 8, 9]) ]);
        expect(findNumCombinationsForSum(44, 8)).toEqual([ new Set([2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findNumCombinationsForSum(45, 8)).toEqual([]);
    });

    test('Num combinations to form a cage in 9 cells', () => {
        expect(findNumCombinationsForSum(44, 9)).toEqual([]);
        expect(findNumCombinationsForSum(45, 9)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findNumCombinationsForSum(46, 9)).toEqual([]);
    });

    test('Invalid cage', () => {
        expect(() => findNumCombinationsForSum(0, 2)).toThrow('Invalid cage: 0');
        expect(() => findNumCombinationsForSum(-1, 2)).toThrow('Invalid cage: -1');
        expect(() => findNumCombinationsForSum('3', 2)).toThrow('Invalid cage: 3');
        expect(() => findNumCombinationsForSum({}, 2)).toThrow('Invalid cage: [object Object]');
        expect(() => findNumCombinationsForSum(undefined, 2)).toThrow('Invalid cage: undefined');
        expect(() => findNumCombinationsForSum(null, 2)).toThrow('Invalid cage: null');
        expect(() => findNumCombinationsForSum(() => {}, 2)).toThrow('Invalid cage: () => {}');
    });

    test('Invalid count', () => {
        expect(() => findNumCombinationsForSum(3, 0)).toThrow('Invalid count: 0');
        expect(() => findNumCombinationsForSum(3, -1)).toThrow('Invalid count: -1');
        expect(() => findNumCombinationsForSum(3, '2')).toThrow('Invalid count: 2');
        expect(() => findNumCombinationsForSum(3, {})).toThrow('Invalid count: [object Object]');
        expect(() => findNumCombinationsForSum(3, null)).toThrow('Invalid count: null');
        expect(() => findNumCombinationsForSum(3, undefined)).toThrow('Invalid count: undefined');
        expect(() => findNumCombinationsForSum(3, () => {})).toThrow('Invalid count: () => {}');
    });
});
