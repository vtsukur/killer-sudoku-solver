import * as _ from 'lodash';
import { Numbers } from '../../../../src/puzzle/numbers';
import { NumCheckingSet } from '../../../../src/solver/math/numCheckingSet';

describe('Unit tests for `NumCheckingSet`', () => {
    test('Construction of `NumCheckingSet` from array of numbers', () => {
        expectFastNumSetWithValues(new NumCheckingSet([ 1, 6, 9 ]), [ 1, 6, 9 ]);
    });

    test('Construction of `NumCheckingSet` using `of` static factory method', () => {
        expectFastNumSetWithValues(NumCheckingSet.of(2, 4, 5), [ 2, 4, 5 ]);
    });

    test('Construction of empty `NumCheckingSet` using constructor', () => {
        expectFastNumSetWithValues(new NumCheckingSet(), []);
    });

    test('Construction of empty `NumCheckingSet` using `of` static factory method', () => {
        expectFastNumSetWithValues(NumCheckingSet.of(), []);
    });

    test('Adding and removing numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const numSet = NumCheckingSet.of(1, 6, 9);
        expect(numSet.hasAll(NumCheckingSet.of(1, 6))).toBeTruthy();
        expect(numSet.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(NumCheckingSet.of(8, 9))).toBeFalsy();

        numSet.add(NumCheckingSet.of(1, 7, 8));
        expectFastNumSetWithValues(numSet, [ 1, 6, 7, 8, 9 ]);
        expect(numSet.hasAll(NumCheckingSet.of(1, 6))).toBeTruthy();
        expect(numSet.hasAll(NumCheckingSet.of(7, 8, 9))).toBeTruthy();
        expect(numSet.hasAll(NumCheckingSet.of(1, 6, 7, 8, 9))).toBeTruthy();
        expect(numSet.hasAll(NumCheckingSet.of(1, 5))).toBeFalsy();
        expect(numSet.hasAll(NumCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(numSet.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(NumCheckingSet.of(5, 9))).toBeFalsy();

        numSet.remove(NumCheckingSet.of(2, 6, 9));
        expectFastNumSetWithValues(numSet, [ 1, 7, 8 ]);
        expect(numSet.hasAll(NumCheckingSet.of(7, 8))).toBeTruthy();
        expect(numSet.hasAll(NumCheckingSet.of(1, 7, 8))).toBeTruthy();
        expect(numSet.hasAll(NumCheckingSet.of(1, 9))).toBeFalsy();
        expect(numSet.hasAll(NumCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(numSet.hasAll(NumCheckingSet.of(1, 6, 7, 8, 9))).toBeFalsy();
        expect(numSet.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(NumCheckingSet.of(8, 9))).toBeFalsy();
    });

    test('Remaining `NumCheckingSet`', () => {
        expect(NumCheckingSet.of().remaining().bitStore32).toBe(
            NumCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).bitStore32
        );
        expect(NumCheckingSet.of(1, 2, 3).remaining().bitStore32).toBe(
            NumCheckingSet.of(4, 5, 6, 7, 8, 9).bitStore32
        );
        expect(NumCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).remaining().bitStore32).toBe(
            NumCheckingSet.of().bitStore32
        );
    });

    const expectFastNumSetWithValues = (numSet: NumCheckingSet, values: ReadonlyArray<number>) => {
        const set = new Set(values);
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            expect(numSet.hasAll(NumCheckingSet.of(num))).toBe(set.has(num));
        });
    };
});
