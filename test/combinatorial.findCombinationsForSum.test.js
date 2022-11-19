import _ from 'lodash';
import { findNumberCombinationsForSum } from '../src/combinatorial';

describe('Tests for the finder of number combinations to form a cage', () => {
    test('Number combinations to form a cage in 1 cell', () => {
        _.range(1, 10).forEach(cage => {
            expect(findNumberCombinationsForSum(cage, 1)).toEqual([ new Set([cage]) ]);
        })
    });

    test('Number combinations to form a cage in 2 cells', () => {
        _.range(1, 3).forEach(cage => {
            expect(findNumberCombinationsForSum(cage, 2)).toEqual([]);
        })
        expect(findNumberCombinationsForSum(3, 2)).toEqual([ new Set([1, 2]) ]);
        expect(findNumberCombinationsForSum(4, 2)).toEqual([ new Set([1, 3]) ]);
        expect(findNumberCombinationsForSum(5, 2)).toEqual([ new Set([1, 4]), new Set([2, 3]) ]);
        expect(findNumberCombinationsForSum(6, 2)).toEqual([ new Set([1, 5]), new Set([2, 4]) ]);
        expect(findNumberCombinationsForSum(7, 2)).toEqual(
            [ new Set([1, 6]), new Set([2, 5]), new Set([3, 4]) ]
        );
        expect(findNumberCombinationsForSum(8, 2)).toEqual(
            [ new Set([1, 7]), new Set([2, 6]), new Set([3, 5]) ]
        );
        expect(findNumberCombinationsForSum(9, 2)).toEqual(
            [ new Set([1, 8]), new Set([2, 7]), new Set([3, 6]), new Set([4, 5]) ]
        );
        expect(findNumberCombinationsForSum(10, 2)).toEqual(
            [ new Set([1, 9]), new Set([2, 8]), new Set([3, 7]), new Set([4, 6]) ]
        );
        expect(findNumberCombinationsForSum(11, 2)).toEqual(
            [ new Set([2, 9]), new Set([3, 8]), new Set([4, 7]), new Set([5, 6]) ]
        );
        expect(findNumberCombinationsForSum(12, 2)).toEqual(
            [ new Set([3, 9]), new Set([4, 8]), new Set([5, 7]) ]
        );
        expect(findNumberCombinationsForSum(13, 2)).toEqual(
            [ new Set([4, 9]), new Set([5, 8]), new Set([6, 7]) ]
        );
        expect(findNumberCombinationsForSum(14, 2)).toEqual([ new Set([5, 9]), new Set([6, 8]) ]);
        expect(findNumberCombinationsForSum(15, 2)).toEqual([ new Set([6, 9]), new Set([7, 8]) ]);
        expect(findNumberCombinationsForSum(16, 2)).toEqual([ new Set([7, 9]) ]);
        expect(findNumberCombinationsForSum(17, 2)).toEqual([ new Set([8, 9]) ]);
        expect(findNumberCombinationsForSum(18, 2)).toEqual([]);
    });

    test('Number combinations to form a cage in 3 cells', () => {
        _.range(1, 6).forEach(cage => {
            expect(findNumberCombinationsForSum(cage, 3)).toEqual([]);
        })
        expect(findNumberCombinationsForSum(6, 3)).toEqual([ new Set([1, 2, 3]) ]);
        expect(findNumberCombinationsForSum(7, 3)).toEqual([ new Set([1, 2, 4]) ]);
        expect(findNumberCombinationsForSum(8, 3)).toEqual([ new Set([1, 2, 5]), new Set([1, 3, 4]) ]);
        expect(findNumberCombinationsForSum(9, 3)).toEqual(
            [ new Set([1, 2, 6]), new Set([1, 3, 5]), new Set([2, 3, 4]) ]
        );
        expect(findNumberCombinationsForSum(10, 3)).toEqual(
            [ new Set([1, 2, 7]), new Set([1, 3, 6]), new Set([1, 4, 5]), new Set([2, 3, 5]) ]
        );
        expect(findNumberCombinationsForSum(11, 3)).toEqual(
            [
                new Set([1, 2, 8]), new Set([1, 3, 7]), new Set([1, 4, 6]),
                new Set([2, 3, 6]), new Set([2, 4, 5])
            ]
        );
        expect(findNumberCombinationsForSum(12, 3)).toEqual(
            [
                new Set([1, 2, 9]), new Set([1, 3, 8]), new Set([1, 4, 7]), new Set([1, 5, 6]),
                new Set([2, 3, 7]), new Set([2, 4, 6]),
                new Set([3, 4, 5])
            ]
        );
        expect(findNumberCombinationsForSum(13, 3)).toEqual(
            [
                new Set([1, 3, 9]), new Set([1, 4, 8]), new Set([1, 5, 7]),
                new Set([2, 3, 8]), new Set([2, 4, 7]), new Set([2, 5, 6]),
                new Set([3, 4, 6])
            ]
        );
        expect(findNumberCombinationsForSum(14, 3)).toEqual(
            [
                new Set([1, 4, 9]), new Set([1, 5, 8]), new Set([1, 6, 7]),
                new Set([2, 3, 9]), new Set([2, 4, 8]), new Set([2, 5, 7]),
                new Set([3, 4, 7]), new Set([3, 5, 6])
            ]
        );
        expect(findNumberCombinationsForSum(15, 3)).toEqual(
            [
                new Set([1, 5, 9]), new Set([1, 6, 8]),
                new Set([2, 4, 9]), new Set([2, 5, 8]), new Set([2, 6, 7]),
                new Set([3, 4, 8]), new Set([3, 5, 7]),
                new Set([4, 5, 6])
            ]
        );
        expect(findNumberCombinationsForSum(16, 3)).toEqual(
            [
                new Set([1, 6, 9]), new Set([1, 7, 8]),
                new Set([2, 5, 9]), new Set([2, 6, 8]),
                new Set([3, 4, 9]), new Set([3, 5, 8]), new Set([3, 6, 7]),
                new Set([4, 5, 7])
            ]
        );
        expect(findNumberCombinationsForSum(17, 3)).toEqual(
            [
                new Set([1, 7, 9]),
                new Set([2, 6, 9]), new Set([2, 7, 8]),
                new Set([3, 5, 9]), new Set([3, 6, 8]),
                new Set([4, 5, 8]), new Set([4, 6, 7])
            ]
        );
        expect(findNumberCombinationsForSum(18, 3)).toEqual(
            [
                new Set([1, 8, 9]),
                new Set([2, 7, 9]),
                new Set([3, 6, 9]), new Set([3, 7, 8]),
                new Set([4, 5, 9]), new Set([4, 6, 8]),
                new Set([5, 6, 7])
            ]
        );
        expect(findNumberCombinationsForSum(19, 3)).toEqual(
            [
                new Set([2, 8, 9]),
                new Set([3, 7, 9]),
                new Set([4, 6, 9]), new Set([4, 7, 8]),
                new Set([5, 6, 8])
            ]
        );
        expect(findNumberCombinationsForSum(20, 3)).toEqual(
            [
                new Set([3, 8, 9]),
                new Set([4, 7, 9]),
                new Set([5, 6, 9]), new Set([5, 7, 8])
            ]
        );
        expect(findNumberCombinationsForSum(21, 3)).toEqual([ new Set([4, 8, 9]), new Set([5, 7, 9]), new Set([6, 7, 8]) ]);
        expect(findNumberCombinationsForSum(22, 3)).toEqual([ new Set([5, 8, 9]), new Set([6, 7, 9]) ]);
        expect(findNumberCombinationsForSum(23, 3)).toEqual([ new Set([6, 8, 9]) ]);
        expect(findNumberCombinationsForSum(24, 3)).toEqual([ new Set([7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(25, 3)).toEqual([]);
    });

    test('Number combinations to form a cage in 4 cells', () => {
        _.range(1, 10).forEach(cage => {
            expect(findNumberCombinationsForSum(cage, 4)).toEqual([]);
        })
        expect(findNumberCombinationsForSum(10, 4)).toEqual([ new Set([1, 2, 3, 4]) ]);
        expect(findNumberCombinationsForSum(11, 4)).toEqual([ new Set([1, 2, 3, 5]) ]);
        expect(findNumberCombinationsForSum(12, 4)).toEqual([ new Set([1, 2, 3, 6]), new Set([1, 2, 4, 5]) ]);
        expect(findNumberCombinationsForSum(13, 4)).toEqual(
            [ new Set([1, 2, 3, 7]), new Set([1, 2, 4, 6]), new Set([1, 3, 4, 5]) ]
        );
        expect(findNumberCombinationsForSum(14, 4)).toEqual(
            [
                new Set([1, 2, 3, 8]), new Set([1, 2, 4, 7]), new Set([1, 2, 5, 6]),
                new Set([1, 3, 4, 6]),
                new Set([2, 3, 4, 5])
            ]
        );
        expect(findNumberCombinationsForSum(15, 4)).toEqual(
            [
                new Set([1, 2, 3, 9]), new Set([1, 2, 4, 8]), new Set([1, 2, 5, 7]),
                new Set([1, 3, 4, 7]), new Set([1, 3, 5, 6]),
                new Set([2, 3, 4, 6])
            ]
        );
        expect(findNumberCombinationsForSum(16, 4)).toEqual(
            [
                new Set([1, 2, 4, 9]), new Set([1, 2, 5, 8]), new Set([1, 2, 6, 7]),
                new Set([1, 3, 4, 8]), new Set([1, 3, 5, 7]),
                new Set([1, 4, 5, 6]),
                new Set([2, 3, 4, 7]), new Set([2, 3, 5, 6])
            ]
        );
        expect(findNumberCombinationsForSum(17, 4)).toEqual(
            [
                new Set([1, 2, 5, 9]), new Set([1, 2, 6, 8]),
                new Set([1, 3, 4, 9]), new Set([1, 3, 5, 8]), new Set([1, 3, 6, 7]),
                new Set([1, 4, 5, 7]),
                new Set([2, 3, 4, 8]), new Set([2, 3, 5, 7]),
                new Set([2, 4, 5, 6])
            ]
        );
        expect(findNumberCombinationsForSum(18, 4)).toEqual(
            [
                new Set([1, 2, 6, 9]), new Set([1, 2, 7, 8]),
                new Set([1, 3, 5, 9]), new Set([1, 3, 6, 8]),
                new Set([1, 4, 5, 8]), new Set([1, 4, 6, 7]),
                new Set([2, 3, 4, 9]), new Set([2, 3, 5, 8]), new Set([2, 3, 6, 7]),
                new Set([2, 4, 5, 7]),
                new Set([3, 4, 5, 6])
            ]
        );
        expect(findNumberCombinationsForSum(19, 4)).toEqual(
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
        expect(findNumberCombinationsForSum(20, 4)).toEqual(
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
        expect(findNumberCombinationsForSum(21, 4)).toEqual(
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
        expect(findNumberCombinationsForSum(22, 4)).toEqual(
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
        expect(findNumberCombinationsForSum(23, 4)).toEqual(
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
        expect(findNumberCombinationsForSum(24, 4)).toEqual(
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
        expect(findNumberCombinationsForSum(25, 4)).toEqual(
            [
                new Set([1, 7, 8, 9]),
                new Set([2, 6, 8, 9]),
                new Set([3, 5, 8, 9]),
                new Set([3, 6, 7, 9]),
                new Set([4, 5, 7, 9]),
                new Set([4, 6, 7, 8])
            ]
        );
        expect(findNumberCombinationsForSum(26, 4)).toEqual(
            [
                new Set([2, 7, 8, 9]),
                new Set([3, 6, 8, 9]),
                new Set([4, 5, 8, 9]),
                new Set([4, 6, 7, 9]),
                new Set([5, 6, 7, 8])
            ]
        );
        expect(findNumberCombinationsForSum(27, 4)).toEqual(
            [
                new Set([3, 7, 8, 9]),
                new Set([4, 6, 8, 9]),
                new Set([5, 6, 7, 9])
            ]
        );
        expect(findNumberCombinationsForSum(28, 4)).toEqual([ new Set([4, 7, 8, 9]), new Set([5, 6, 8, 9]) ]);
        expect(findNumberCombinationsForSum(29, 4)).toEqual([ new Set([5, 7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(30, 4)).toEqual([ new Set([6, 7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(31, 4)).toEqual([]);
    });

    test('Number combinations to form a cage in 5 cells (shallow coverage)', () => {
        _.range(1, 15).forEach(cage => {
            expect(findNumberCombinationsForSum(cage, 5)).toEqual([]);
        })
        expect(findNumberCombinationsForSum(15, 5)).toEqual([ new Set([1, 2, 3, 4, 5]) ]);
        expect(findNumberCombinationsForSum(30, 5)).toEqual(
            [
                new Set([1, 5, 7, 8, 9]),
                new Set([2, 4, 7, 8, 9]),
                new Set([2, 5, 6, 8, 9]),
                new Set([3, 4, 6, 8, 9]),
                new Set([3, 5, 6, 7, 9]),
                new Set([4, 5, 6, 7, 8])
            ]
        );
        expect(findNumberCombinationsForSum(35, 5)).toEqual([ new Set([5, 6, 7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(36, 5)).toEqual([]);
    });

    test('Number combinations to form a cage in 6 cells (shallow coverage)', () => {
        _.range(1, 21).forEach(cage => {
            expect(findNumberCombinationsForSum(cage, 6)).toEqual([]);
        })
        expect(findNumberCombinationsForSum(21, 6)).toEqual([ new Set([1, 2, 3, 4, 5, 6]) ]);
        expect(findNumberCombinationsForSum(30, 6)).toEqual(
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
        expect(findNumberCombinationsForSum(39, 6)).toEqual([ new Set([4, 5, 6, 7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(40, 6)).toEqual([]);
    });

    test('Number combinations to form a cage in 7 cells (shallow coverage)', () => {
        expect(findNumberCombinationsForSum(27, 7)).toEqual([]);
        expect(findNumberCombinationsForSum(28, 7)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7]) ]);
        expect(findNumberCombinationsForSum(36, 7)).toEqual(
            [
                new Set([1, 2, 3, 6, 7, 8, 9]),
                new Set([1, 2, 4, 5, 7, 8, 9]),
                new Set([1, 3, 4, 5, 6, 8, 9]),
                new Set([2, 3, 4, 5, 6, 7, 9])
            ]
        );
        expect(findNumberCombinationsForSum(42, 7)).toEqual([ new Set([3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(43, 7)).toEqual([]);
    });

    test('Number combinations to form a cage in 8 cells (shallow coverage)', () => {
        expect(findNumberCombinationsForSum(35, 8)).toEqual([]);
        expect(findNumberCombinationsForSum(36, 8)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8]) ]);
        expect(findNumberCombinationsForSum(40, 8)).toEqual([ new Set([1, 2, 3, 4, 6, 7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(44, 8)).toEqual([ new Set([2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(45, 8)).toEqual([]);
    });

    test('Number combinations to form a cage in 9 cells', () => {
        expect(findNumberCombinationsForSum(44, 9)).toEqual([]);
        expect(findNumberCombinationsForSum(45, 9)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(findNumberCombinationsForSum(46, 9)).toEqual([]);
    });

    test('Invalid cage', () => {
        expect(() => findNumberCombinationsForSum(0, 2)).toThrow('Invalid cage: 0');
        expect(() => findNumberCombinationsForSum(-1, 2)).toThrow('Invalid cage: -1');
        expect(() => findNumberCombinationsForSum('3', 2)).toThrow('Invalid cage: 3');
        expect(() => findNumberCombinationsForSum({}, 2)).toThrow('Invalid cage: [object Object]');
        expect(() => findNumberCombinationsForSum(undefined, 2)).toThrow('Invalid cage: undefined');
        expect(() => findNumberCombinationsForSum(null, 2)).toThrow('Invalid cage: null');
        expect(() => findNumberCombinationsForSum(() => {}, 2)).toThrow('Invalid cage: () => {}');
    });

    test('Invalid count', () => {
        expect(() => findNumberCombinationsForSum(3, 0)).toThrow('Invalid count: 0');
        expect(() => findNumberCombinationsForSum(3, -1)).toThrow('Invalid count: -1');
        expect(() => findNumberCombinationsForSum(3, '2')).toThrow('Invalid count: 2');
        expect(() => findNumberCombinationsForSum(3, {})).toThrow('Invalid count: [object Object]');
        expect(() => findNumberCombinationsForSum(3, null)).toThrow('Invalid count: null');
        expect(() => findNumberCombinationsForSum(3, undefined)).toThrow('Invalid count: undefined');
        expect(() => findNumberCombinationsForSum(3, () => {})).toThrow('Invalid count: () => {}');
    });
});
