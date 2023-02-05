import * as _ from 'lodash';
import { Numbers } from '../../../../src/puzzle/numbers';
import { NumFlags } from '../../../../src/solver/math';

describe('NumFlags tests', () => {
    test('Construction of NumFlags from array of numbers', () => {
        expectNumFlagsWithValues(new NumFlags([ 1, 6, 9 ]), [ 1, 6, 9 ]);
    });

    test('Construction of NumFlags using `of` static factory method', () => {
        expectNumFlagsWithValues(NumFlags.of(2, 4, 5), [ 2, 4, 5 ]);
    });

    test('Construction of empty NumFlags using constructor', () => {
        expectNumFlagsWithValues(new NumFlags(), []);
    });

    test('Construction of empty NumFlags using `of` static factory method', () => {
        expectNumFlagsWithValues(NumFlags.of(), []);
    });

    test('Marking and unmarking numbers with `has` and `doesNotHaveAny` checks', () => {
        const numFlags = NumFlags.of(1, 6, 9);
        expect(numFlags.has(NumFlags.of(1, 6))).toBeTruthy();
        expect(numFlags.doesNotHaveAny(NumFlags.of(2, 3))).toBeTruthy();
        expect(numFlags.doesNotHaveAny(NumFlags.of(8, 9))).toBeFalsy();

        numFlags.mark(NumFlags.of(1, 7, 8));
        expectNumFlagsWithValues(numFlags, [ 1, 6, 7, 8, 9 ]);
        expect(numFlags.has(NumFlags.of(1, 6))).toBeTruthy();
        expect(numFlags.has(NumFlags.of(7, 8, 9))).toBeTruthy();
        expect(numFlags.has(NumFlags.of(1, 6, 7, 8, 9))).toBeTruthy();
        expect(numFlags.has(NumFlags.of(1, 5))).toBeFalsy();
        expect(numFlags.has(NumFlags.of(2, 6, 9))).toBeFalsy();
        expect(numFlags.doesNotHaveAny(NumFlags.of(2, 3))).toBeTruthy();
        expect(numFlags.doesNotHaveAny(NumFlags.of(5, 9))).toBeFalsy();

        numFlags.unmark(NumFlags.of(2, 6, 9));
        expectNumFlagsWithValues(numFlags, [ 1, 7, 8 ]);
        expect(numFlags.has(NumFlags.of(7, 8))).toBeTruthy();
        expect(numFlags.has(NumFlags.of(1, 7, 8))).toBeTruthy();
        expect(numFlags.has(NumFlags.of(1, 9))).toBeFalsy();
        expect(numFlags.has(NumFlags.of(2, 6, 9))).toBeFalsy();
        expect(numFlags.has(NumFlags.of(1, 6, 7, 8, 9))).toBeFalsy();
        expect(numFlags.doesNotHaveAny(NumFlags.of(2, 3))).toBeTruthy();
        expect(numFlags.doesNotHaveAny(NumFlags.of(8, 9))).toBeFalsy();
    });

    const expectNumFlagsWithValues = (numFlags: NumFlags, values: ReadonlyArray<number>) => {
        const set = new Set(values);
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            expect(numFlags.has(NumFlags.of(num))).toBe(set.has(num));
        });
    };
});
