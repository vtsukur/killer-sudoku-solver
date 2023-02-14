import * as _ from 'lodash';
import { Numbers } from '../../../../src/puzzle/numbers';
import { NumCheckingSet, ReadonlyNumCheckingSet } from '../../../../src/solver/math/numCheckingSet';

describe('Unit tests for `NumCheckingSet`', () => {
    test('Construction of `NumCheckingSet` from array of numbers', () => {
        expectSetWithValues(new NumCheckingSet([ 1, 6, 9 ]), [ 1, 6, 9 ]);
    });

    test('Construction of `NumCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(NumCheckingSet.of(2, 4, 5), [ 2, 4, 5 ]);
    });

    test('Construction of empty `NumCheckingSet` using constructor', () => {
        expectSetWithValues(new NumCheckingSet(), []);
    });

    test('Construction of empty `NumCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(NumCheckingSet.of(), []);
    });

    test('Adding and removing numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const set = NumCheckingSet.of(1, 6, 9);
        expect(set.hasAll(NumCheckingSet.of(1, 6))).toBeTruthy();
        expect(set.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(NumCheckingSet.of(8, 9))).toBeFalsy();

        set.add(NumCheckingSet.of(1, 7, 8));
        expectSetWithValues(set, [ 1, 6, 7, 8, 9 ]);
        expect(set.hasAll(NumCheckingSet.of(1, 6))).toBeTruthy();
        expect(set.hasAll(NumCheckingSet.of(7, 8, 9))).toBeTruthy();
        expect(set.hasAll(NumCheckingSet.of(1, 6, 7, 8, 9))).toBeTruthy();
        expect(set.hasAll(NumCheckingSet.of(1, 5))).toBeFalsy();
        expect(set.hasAll(NumCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(set.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(NumCheckingSet.of(5, 9))).toBeFalsy();

        set.remove(NumCheckingSet.of(2, 6, 9));
        expectSetWithValues(set, [ 1, 7, 8 ]);
        expect(set.hasAll(NumCheckingSet.of(7, 8))).toBeTruthy();
        expect(set.hasAll(NumCheckingSet.of(1, 7, 8))).toBeTruthy();
        expect(set.hasAll(NumCheckingSet.of(1, 9))).toBeFalsy();
        expect(set.hasAll(NumCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(set.hasAll(NumCheckingSet.of(1, 6, 7, 8, 9))).toBeFalsy();
        expect(set.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(NumCheckingSet.of(8, 9))).toBeFalsy();
    });

    test('Remaining `NumCheckingSet`', () => {
        expect(NumCheckingSet.of().remaining().bitStore).toBe(
            NumCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).bitStore
        );
        expect(NumCheckingSet.of(1, 2, 3).remaining().bitStore).toBe(
            NumCheckingSet.of(4, 5, 6, 7, 8, 9).bitStore
        );
        expect(NumCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).remaining().bitStore).toBe(
            NumCheckingSet.of().bitStore
        );
    });

    const expectSetWithValues = (numCheckingSet: ReadonlyNumCheckingSet, values: ReadonlyArray<number>) => {
        const set = new Set(values);
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            expect(numCheckingSet.hasAll(NumCheckingSet.of(num))).toBe(set.has(num));
        });
    };
});
