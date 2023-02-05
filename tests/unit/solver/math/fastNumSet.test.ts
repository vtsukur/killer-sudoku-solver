import * as _ from 'lodash';
import { Numbers } from '../../../../src/puzzle/numbers';
import { FastNumSet } from '../../../../src/solver/math/fastNumSet';

describe('FastNumSet tests', () => {
    test('Construction of FastNumSet from array of numbers', () => {
        expectFastNumSetWithValues(new FastNumSet([ 1, 6, 9 ]), [ 1, 6, 9 ]);
    });

    test('Construction of FastNumSet using `of` static factory method', () => {
        expectFastNumSetWithValues(FastNumSet.of(2, 4, 5), [ 2, 4, 5 ]);
    });

    test('Construction of empty FastNumSet using constructor', () => {
        expectFastNumSetWithValues(new FastNumSet(), []);
    });

    test('Construction of empty FastNumSet using `of` static factory method', () => {
        expectFastNumSetWithValues(FastNumSet.of(), []);
    });

    test('Adding and removing numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const numSet = FastNumSet.of(1, 6, 9);
        expect(numSet.hasAll(FastNumSet.of(1, 6))).toBeTruthy();
        expect(numSet.doesNotHaveAny(FastNumSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(FastNumSet.of(8, 9))).toBeFalsy();

        numSet.add(FastNumSet.of(1, 7, 8));
        expectFastNumSetWithValues(numSet, [ 1, 6, 7, 8, 9 ]);
        expect(numSet.hasAll(FastNumSet.of(1, 6))).toBeTruthy();
        expect(numSet.hasAll(FastNumSet.of(7, 8, 9))).toBeTruthy();
        expect(numSet.hasAll(FastNumSet.of(1, 6, 7, 8, 9))).toBeTruthy();
        expect(numSet.hasAll(FastNumSet.of(1, 5))).toBeFalsy();
        expect(numSet.hasAll(FastNumSet.of(2, 6, 9))).toBeFalsy();
        expect(numSet.doesNotHaveAny(FastNumSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(FastNumSet.of(5, 9))).toBeFalsy();

        numSet.remove(FastNumSet.of(2, 6, 9));
        expectFastNumSetWithValues(numSet, [ 1, 7, 8 ]);
        expect(numSet.hasAll(FastNumSet.of(7, 8))).toBeTruthy();
        expect(numSet.hasAll(FastNumSet.of(1, 7, 8))).toBeTruthy();
        expect(numSet.hasAll(FastNumSet.of(1, 9))).toBeFalsy();
        expect(numSet.hasAll(FastNumSet.of(2, 6, 9))).toBeFalsy();
        expect(numSet.hasAll(FastNumSet.of(1, 6, 7, 8, 9))).toBeFalsy();
        expect(numSet.doesNotHaveAny(FastNumSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(FastNumSet.of(8, 9))).toBeFalsy();
    });

    const expectFastNumSetWithValues = (numSet: FastNumSet, values: ReadonlyArray<number>) => {
        const set = new Set(values);
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            expect(numSet.hasAll(FastNumSet.of(num))).toBe(set.has(num));
        });
    };
});
