import * as _ from 'lodash';
import { Numbers } from '../../../../src/puzzle/numbers';
import { SudokuNumsCheckingSet, ReadonlySudokuNumsCheckingSet } from '../../../../src/solver/math/sudokuNumsCheckingSet';

describe('Unit tests for `SudokuNumsCheckingSet`', () => {
    test('Construction of `SudokuNumsCheckingSet` from array of numbers', () => {
        expectSetWithValues(new SudokuNumsCheckingSet([ 1, 6, 9 ]), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(SudokuNumsCheckingSet.of(2, 4, 5), [ 2, 4, 5 ]);
    });

    test('Construction of empty `SudokuNumsCheckingSet` using constructor', () => {
        expectSetWithValues(new SudokuNumsCheckingSet(), []);
    });

    test('Construction of empty `SudokuNumsCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(SudokuNumsCheckingSet.of(), []);
    });

    test('Adding and removing numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const numsCheckingSet = SudokuNumsCheckingSet.of(1, 6, 9);
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(1, 6))).toBeTruthy();
        expect(numsCheckingSet.doesNotHaveAny(SudokuNumsCheckingSet.of(2, 3))).toBeTruthy();
        expect(numsCheckingSet.doesNotHaveAny(SudokuNumsCheckingSet.of(8, 9))).toBeFalsy();

        numsCheckingSet.add(SudokuNumsCheckingSet.of(1, 7, 8));
        expectSetWithValues(numsCheckingSet, [ 1, 6, 7, 8, 9 ]);
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(1, 6))).toBeTruthy();
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(7, 8, 9))).toBeTruthy();
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(1, 6, 7, 8, 9))).toBeTruthy();
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(1, 5))).toBeFalsy();
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(numsCheckingSet.doesNotHaveAny(SudokuNumsCheckingSet.of(2, 3))).toBeTruthy();
        expect(numsCheckingSet.doesNotHaveAny(SudokuNumsCheckingSet.of(5, 9))).toBeFalsy();

        numsCheckingSet.remove(SudokuNumsCheckingSet.of(2, 6, 9));
        expectSetWithValues(numsCheckingSet, [ 1, 7, 8 ]);
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(7, 8))).toBeTruthy();
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(1, 7, 8))).toBeTruthy();
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(1, 9))).toBeFalsy();
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(1, 6, 7, 8, 9))).toBeFalsy();
        expect(numsCheckingSet.doesNotHaveAny(SudokuNumsCheckingSet.of(2, 3))).toBeTruthy();
        expect(numsCheckingSet.doesNotHaveAny(SudokuNumsCheckingSet.of(8, 9))).toBeFalsy();
    });

    test('Instance of `NumsCheckingSet` with remaining numbers', () => {
        expect(SudokuNumsCheckingSet.of().remaining.bitStore).toBe(
            SudokuNumsCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).bitStore
        );
        expect(SudokuNumsCheckingSet.of(1, 2, 3).remaining.bitStore).toBe(
            SudokuNumsCheckingSet.of(4, 5, 6, 7, 8, 9).bitStore
        );
        expect(SudokuNumsCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).remaining.bitStore).toBe(
            SudokuNumsCheckingSet.of().bitStore
        );
    });

    const expectSetWithValues = (numsCheckingSet: ReadonlySudokuNumsCheckingSet, values: ReadonlyArray<number>) => {
        const set = new Set(values);
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            expect(numsCheckingSet.hasAll(SudokuNumsCheckingSet.of(num))).toBe(set.has(num));
        });
    };
});
