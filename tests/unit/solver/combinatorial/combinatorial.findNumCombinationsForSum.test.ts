import * as _ from 'lodash';
import { Numbers } from '../../../../src/puzzle/numbers';
import { combosForSum } from '../../../../src/solver/combinatorial/combinatorial';

describe('Tests for the finder of number combinations to form a cage', () => {
    test('Number combinations to form a Cage in 1 Cell', () => {
        _.range(1, Numbers.MAX + 1).forEach(num => {
            expect(combosForSum(num, 1)).toEqual([ new Set([ num ]) ]);
        });
    });

    test('Num combinations to form a cage in 2 cells', () => {
        _.range(1, 3).forEach(cage => {
            expect(combosForSum(cage, 2)).toEqual([]);
        });
        expect(combosForSum(3, 2)).toEqual([ new Set([1, 2]) ]);
        expect(combosForSum(4, 2)).toEqual([ new Set([1, 3]) ]);
        expect(combosForSum(5, 2)).toEqual([ new Set([1, 4]), new Set([2, 3]) ]);
        expect(combosForSum(6, 2)).toEqual([ new Set([1, 5]), new Set([2, 4]) ]);
        expect(combosForSum(7, 2)).toEqual(
            [ new Set([1, 6]), new Set([2, 5]), new Set([3, 4]) ]
        );
        expect(combosForSum(8, 2)).toEqual(
            [ new Set([1, 7]), new Set([2, 6]), new Set([3, 5]) ]
        );
        expect(combosForSum(9, 2)).toEqual(
            [ new Set([1, 8]), new Set([2, 7]), new Set([3, 6]), new Set([4, 5]) ]
        );
        expect(combosForSum(10, 2)).toEqual(
            [ new Set([1, 9]), new Set([2, 8]), new Set([3, 7]), new Set([4, 6]) ]
        );
        expect(combosForSum(11, 2)).toEqual(
            [ new Set([2, 9]), new Set([3, 8]), new Set([4, 7]), new Set([5, 6]) ]
        );
        expect(combosForSum(12, 2)).toEqual(
            [ new Set([3, 9]), new Set([4, 8]), new Set([5, 7]) ]
        );
        expect(combosForSum(13, 2)).toEqual(
            [ new Set([4, 9]), new Set([5, 8]), new Set([6, 7]) ]
        );
        expect(combosForSum(14, 2)).toEqual([ new Set([5, 9]), new Set([6, 8]) ]);
        expect(combosForSum(15, 2)).toEqual([ new Set([6, 9]), new Set([7, 8]) ]);
        expect(combosForSum(16, 2)).toEqual([ new Set([7, 9]) ]);
        expect(combosForSum(17, 2)).toEqual([ new Set([8, 9]) ]);
        expect(combosForSum(18, 2)).toEqual([]);
    });

    test('Num combinations to form a cage in 3 cells', () => {
        _.range(1, 6).forEach(cage => {
            expect(combosForSum(cage, 3)).toEqual([]);
        });
        expect(combosForSum(6, 3)).toEqual([ new Set([1, 2, 3]) ]);
        expect(combosForSum(7, 3)).toEqual([ new Set([1, 2, 4]) ]);
        expect(combosForSum(8, 3)).toEqual([ new Set([1, 2, 5]), new Set([1, 3, 4]) ]);
        expect(combosForSum(9, 3)).toEqual(
            [ new Set([1, 2, 6]), new Set([1, 3, 5]), new Set([2, 3, 4]) ]
        );
        expect(combosForSum(10, 3)).toEqual(
            [ new Set([1, 2, 7]), new Set([1, 3, 6]), new Set([1, 4, 5]), new Set([2, 3, 5]) ]
        );
        expect(combosForSum(11, 3)).toEqual(
            [
                new Set([1, 2, 8]), new Set([1, 3, 7]), new Set([1, 4, 6]),
                new Set([2, 3, 6]), new Set([2, 4, 5])
            ]
        );
        expect(combosForSum(12, 3)).toEqual(
            [
                new Set([1, 2, 9]), new Set([1, 3, 8]), new Set([1, 4, 7]), new Set([1, 5, 6]),
                new Set([2, 3, 7]), new Set([2, 4, 6]),
                new Set([3, 4, 5])
            ]
        );
        expect(combosForSum(13, 3)).toEqual(
            [
                new Set([1, 3, 9]), new Set([1, 4, 8]), new Set([1, 5, 7]),
                new Set([2, 3, 8]), new Set([2, 4, 7]), new Set([2, 5, 6]),
                new Set([3, 4, 6])
            ]
        );
        expect(combosForSum(14, 3)).toEqual(
            [
                new Set([1, 4, 9]), new Set([1, 5, 8]), new Set([1, 6, 7]),
                new Set([2, 3, 9]), new Set([2, 4, 8]), new Set([2, 5, 7]),
                new Set([3, 4, 7]), new Set([3, 5, 6])
            ]
        );
        expect(combosForSum(15, 3)).toEqual(
            [
                new Set([1, 5, 9]), new Set([1, 6, 8]),
                new Set([2, 4, 9]), new Set([2, 5, 8]), new Set([2, 6, 7]),
                new Set([3, 4, 8]), new Set([3, 5, 7]),
                new Set([4, 5, 6])
            ]
        );
        expect(combosForSum(16, 3)).toEqual(
            [
                new Set([1, 6, 9]), new Set([1, 7, 8]),
                new Set([2, 5, 9]), new Set([2, 6, 8]),
                new Set([3, 4, 9]), new Set([3, 5, 8]), new Set([3, 6, 7]),
                new Set([4, 5, 7])
            ]
        );
        expect(combosForSum(17, 3)).toEqual(
            [
                new Set([1, 7, 9]),
                new Set([2, 6, 9]), new Set([2, 7, 8]),
                new Set([3, 5, 9]), new Set([3, 6, 8]),
                new Set([4, 5, 8]), new Set([4, 6, 7])
            ]
        );
        expect(combosForSum(18, 3)).toEqual(
            [
                new Set([1, 8, 9]),
                new Set([2, 7, 9]),
                new Set([3, 6, 9]), new Set([3, 7, 8]),
                new Set([4, 5, 9]), new Set([4, 6, 8]),
                new Set([5, 6, 7])
            ]
        );
        expect(combosForSum(19, 3)).toEqual(
            [
                new Set([2, 8, 9]),
                new Set([3, 7, 9]),
                new Set([4, 6, 9]), new Set([4, 7, 8]),
                new Set([5, 6, 8])
            ]
        );
        expect(combosForSum(20, 3)).toEqual(
            [
                new Set([3, 8, 9]),
                new Set([4, 7, 9]),
                new Set([5, 6, 9]), new Set([5, 7, 8])
            ]
        );
        expect(combosForSum(21, 3)).toEqual([ new Set([4, 8, 9]), new Set([5, 7, 9]), new Set([6, 7, 8]) ]);
        expect(combosForSum(22, 3)).toEqual([ new Set([5, 8, 9]), new Set([6, 7, 9]) ]);
        expect(combosForSum(23, 3)).toEqual([ new Set([6, 8, 9]) ]);
        expect(combosForSum(24, 3)).toEqual([ new Set([7, 8, 9]) ]);
        expect(combosForSum(25, 3)).toEqual([]);
    });

    test('Num combinations to form a cage in 4 cells', () => {
        _.range(1, 10).forEach(cage => {
            expect(combosForSum(cage, 4)).toEqual([]);
        });
        expect(combosForSum(10, 4)).toEqual([ new Set([1, 2, 3, 4]) ]);
        expect(combosForSum(11, 4)).toEqual([ new Set([1, 2, 3, 5]) ]);
        expect(combosForSum(12, 4)).toEqual([ new Set([1, 2, 3, 6]), new Set([1, 2, 4, 5]) ]);
        expect(combosForSum(13, 4)).toEqual(
            [ new Set([1, 2, 3, 7]), new Set([1, 2, 4, 6]), new Set([1, 3, 4, 5]) ]
        );
        expect(combosForSum(14, 4)).toEqual(
            [
                new Set([1, 2, 3, 8]), new Set([1, 2, 4, 7]), new Set([1, 2, 5, 6]),
                new Set([1, 3, 4, 6]),
                new Set([2, 3, 4, 5])
            ]
        );
        expect(combosForSum(15, 4)).toEqual(
            [
                new Set([1, 2, 3, 9]), new Set([1, 2, 4, 8]), new Set([1, 2, 5, 7]),
                new Set([1, 3, 4, 7]), new Set([1, 3, 5, 6]),
                new Set([2, 3, 4, 6])
            ]
        );
        expect(combosForSum(16, 4)).toEqual(
            [
                new Set([1, 2, 4, 9]), new Set([1, 2, 5, 8]), new Set([1, 2, 6, 7]),
                new Set([1, 3, 4, 8]), new Set([1, 3, 5, 7]),
                new Set([1, 4, 5, 6]),
                new Set([2, 3, 4, 7]), new Set([2, 3, 5, 6])
            ]
        );
        expect(combosForSum(17, 4)).toEqual(
            [
                new Set([1, 2, 5, 9]), new Set([1, 2, 6, 8]),
                new Set([1, 3, 4, 9]), new Set([1, 3, 5, 8]), new Set([1, 3, 6, 7]),
                new Set([1, 4, 5, 7]),
                new Set([2, 3, 4, 8]), new Set([2, 3, 5, 7]),
                new Set([2, 4, 5, 6])
            ]
        );
        expect(combosForSum(18, 4)).toEqual(
            [
                new Set([1, 2, 6, 9]), new Set([1, 2, 7, 8]),
                new Set([1, 3, 5, 9]), new Set([1, 3, 6, 8]),
                new Set([1, 4, 5, 8]), new Set([1, 4, 6, 7]),
                new Set([2, 3, 4, 9]), new Set([2, 3, 5, 8]), new Set([2, 3, 6, 7]),
                new Set([2, 4, 5, 7]),
                new Set([3, 4, 5, 6])
            ]
        );
        expect(combosForSum(19, 4)).toEqual(
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
        expect(combosForSum(20, 4)).toEqual(
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
        expect(combosForSum(21, 4)).toEqual(
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
        expect(combosForSum(22, 4)).toEqual(
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
        expect(combosForSum(23, 4)).toEqual(
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
        expect(combosForSum(24, 4)).toEqual(
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
        expect(combosForSum(25, 4)).toEqual(
            [
                new Set([1, 7, 8, 9]),
                new Set([2, 6, 8, 9]),
                new Set([3, 5, 8, 9]),
                new Set([3, 6, 7, 9]),
                new Set([4, 5, 7, 9]),
                new Set([4, 6, 7, 8])
            ]
        );
        expect(combosForSum(26, 4)).toEqual(
            [
                new Set([2, 7, 8, 9]),
                new Set([3, 6, 8, 9]),
                new Set([4, 5, 8, 9]),
                new Set([4, 6, 7, 9]),
                new Set([5, 6, 7, 8])
            ]
        );
        expect(combosForSum(27, 4)).toEqual(
            [
                new Set([3, 7, 8, 9]),
                new Set([4, 6, 8, 9]),
                new Set([5, 6, 7, 9])
            ]
        );
        expect(combosForSum(28, 4)).toEqual([ new Set([4, 7, 8, 9]), new Set([5, 6, 8, 9]) ]);
        expect(combosForSum(29, 4)).toEqual([ new Set([5, 7, 8, 9]) ]);
        expect(combosForSum(30, 4)).toEqual([ new Set([6, 7, 8, 9]) ]);
        expect(combosForSum(31, 4)).toEqual([]);
    });

    test('Num combinations to form a cage in 5 cells (shallow coverage)', () => {
        _.range(1, 15).forEach(cage => {
            expect(combosForSum(cage, 5)).toEqual([]);
        });
        expect(combosForSum(15, 5)).toEqual([ new Set([1, 2, 3, 4, 5]) ]);
        expect(combosForSum(30, 5)).toEqual(
            [
                new Set([1, 5, 7, 8, 9]),
                new Set([2, 4, 7, 8, 9]),
                new Set([2, 5, 6, 8, 9]),
                new Set([3, 4, 6, 8, 9]),
                new Set([3, 5, 6, 7, 9]),
                new Set([4, 5, 6, 7, 8])
            ]
        );
        expect(combosForSum(35, 5)).toEqual([ new Set([5, 6, 7, 8, 9]) ]);
        expect(combosForSum(36, 5)).toEqual([]);
    });

    test('Num combinations to form a cage in 6 cells (shallow coverage)', () => {
        _.range(1, 21).forEach(cage => {
            expect(combosForSum(cage, 6)).toEqual([]);
        });
        expect(combosForSum(21, 6)).toEqual([ new Set([1, 2, 3, 4, 5, 6]) ]);
        expect(combosForSum(30, 6)).toEqual(
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
        expect(combosForSum(39, 6)).toEqual([ new Set([4, 5, 6, 7, 8, 9]) ]);
        expect(combosForSum(40, 6)).toEqual([]);
    });

    test('Num combinations to form a cage in 7 cells (shallow coverage)', () => {
        expect(combosForSum(27, 7)).toEqual([]);
        expect(combosForSum(28, 7)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7]) ]);
        expect(combosForSum(36, 7)).toEqual(
            [
                new Set([1, 2, 3, 6, 7, 8, 9]),
                new Set([1, 2, 4, 5, 7, 8, 9]),
                new Set([1, 3, 4, 5, 6, 8, 9]),
                new Set([2, 3, 4, 5, 6, 7, 9])
            ]
        );
        expect(combosForSum(42, 7)).toEqual([ new Set([3, 4, 5, 6, 7, 8, 9]) ]);
        expect(combosForSum(43, 7)).toEqual([]);
    });

    test('Num combinations to form a cage in 8 cells (shallow coverage)', () => {
        expect(combosForSum(35, 8)).toEqual([]);
        expect(combosForSum(36, 8)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8]) ]);
        expect(combosForSum(40, 8)).toEqual([ new Set([1, 2, 3, 4, 6, 7, 8, 9]) ]);
        expect(combosForSum(44, 8)).toEqual([ new Set([2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(combosForSum(45, 8)).toEqual([]);
    });

    test('Num combinations to form a cage in 9 cells', () => {
        expect(combosForSum(44, 9)).toEqual([]);
        expect(combosForSum(45, 9)).toEqual([ new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]) ]);
        expect(combosForSum(46, 9)).toEqual([]);
    });

    test('Invalid cage', () => {
        expect(() => combosForSum(0, 2)).toThrow('Invalid cage: 0');
        expect(() => combosForSum(-1, 2)).toThrow('Invalid cage: -1');
    });

    test('Invalid count', () => {
        expect(() => combosForSum(3, 0)).toThrow('Invalid count: 0');
        expect(() => combosForSum(3, -1)).toThrow('Invalid count: -1');
    });
});
