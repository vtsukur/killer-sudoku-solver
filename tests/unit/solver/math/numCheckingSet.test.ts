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
        const checkingSet = NumCheckingSet.of(1, 6, 9);
        expect(checkingSet.hasAll(NumCheckingSet.of(1, 6))).toBeTruthy();
        expect(checkingSet.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(checkingSet.doesNotHaveAny(NumCheckingSet.of(8, 9))).toBeFalsy();

        checkingSet.add(NumCheckingSet.of(1, 7, 8));
        expectSetWithValues(checkingSet, [ 1, 6, 7, 8, 9 ]);
        expect(checkingSet.hasAll(NumCheckingSet.of(1, 6))).toBeTruthy();
        expect(checkingSet.hasAll(NumCheckingSet.of(7, 8, 9))).toBeTruthy();
        expect(checkingSet.hasAll(NumCheckingSet.of(1, 6, 7, 8, 9))).toBeTruthy();
        expect(checkingSet.hasAll(NumCheckingSet.of(1, 5))).toBeFalsy();
        expect(checkingSet.hasAll(NumCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(checkingSet.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(checkingSet.doesNotHaveAny(NumCheckingSet.of(5, 9))).toBeFalsy();

        checkingSet.remove(NumCheckingSet.of(2, 6, 9));
        expectSetWithValues(checkingSet, [ 1, 7, 8 ]);
        expect(checkingSet.hasAll(NumCheckingSet.of(7, 8))).toBeTruthy();
        expect(checkingSet.hasAll(NumCheckingSet.of(1, 7, 8))).toBeTruthy();
        expect(checkingSet.hasAll(NumCheckingSet.of(1, 9))).toBeFalsy();
        expect(checkingSet.hasAll(NumCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(checkingSet.hasAll(NumCheckingSet.of(1, 6, 7, 8, 9))).toBeFalsy();
        expect(checkingSet.doesNotHaveAny(NumCheckingSet.of(2, 3))).toBeTruthy();
        expect(checkingSet.doesNotHaveAny(NumCheckingSet.of(8, 9))).toBeFalsy();
    });

    const expectSetWithValues = (numCheckingSet: ReadonlyNumCheckingSet, values: ReadonlyArray<number>) => {
        const set = new Set(values);
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            expect(numCheckingSet.hasAll(NumCheckingSet.of(num))).toBe(set.has(num));
        });
    };
});
