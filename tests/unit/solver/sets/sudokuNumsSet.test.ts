import { SudokuNums } from '../../../../src/puzzle/sudokuNums';
import { ReadonlySudokuNumsCheckingSet, SudokuNumsCheckingSet } from '../../../../src/solver/sets';

describe('Unit tests for `SudokuNumsCheckingSet`', () => {

    test('Construction of `SudokuNumsCheckingSet` from array of numbers', () => {
        expectSetWithValues(new SudokuNumsCheckingSet([ 1, 6, 9 ]), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsCheckingSet` from another set', () => {
        expectSetWithValues(new SudokuNumsCheckingSet(new SudokuNumsCheckingSet([ 1, 6, 9 ])), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsCheckingSet` from `BitStore32`', () => {
        expectSetWithValues(new SudokuNumsCheckingSet(1 << 1 | 1 << 6 | 1 << 9), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(SudokuNumsCheckingSet.of(2, 4, 5), [ 2, 4, 5 ]);
    });

    test('Construction of `SudokuNumsCheckingSet` with a single number using `ofSingle` static factory method', () => {
        expectSetWithValues(SudokuNumsCheckingSet.of(3), [ 3 ]);
    });

    test('Construction of empty `SudokuNumsCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(SudokuNumsCheckingSet.of(), []);
    });

    test('Construction of empty `SudokuNumsCheckingSet` using `newEmpty` static factory method', () => {
        expectSetWithValues(SudokuNumsCheckingSet.newEmpty(), []);
    });

    test('Construction of `SudokuNumsCheckingSet` with all numbers using `all` static factory method', () => {
        expectSetWithValues(SudokuNumsCheckingSet.all(), [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
    });

    test('Adding and deleting many numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const set = SudokuNumsCheckingSet.of(1, 6, 9);
        expect(set.hasAll(SudokuNumsCheckingSet.of(1, 6))).toBeTruthy();
        expect(set.doesNotHaveAny(SudokuNumsCheckingSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(SudokuNumsCheckingSet.of(8, 9))).toBeFalsy();

        set.addAll(SudokuNumsCheckingSet.of(1, 7, 8));
        expectSetWithValues(set, [ 1, 6, 7, 8, 9 ]);
        expect(set.hasAll(SudokuNumsCheckingSet.of(1, 6))).toBeTruthy();
        expect(set.hasAll(SudokuNumsCheckingSet.of(7, 8, 9))).toBeTruthy();
        expect(set.hasAll(SudokuNumsCheckingSet.of(1, 6, 7, 8, 9))).toBeTruthy();
        expect(set.hasAll(SudokuNumsCheckingSet.of(1, 5))).toBeFalsy();
        expect(set.hasAll(SudokuNumsCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(set.doesNotHaveAny(SudokuNumsCheckingSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(SudokuNumsCheckingSet.of(5, 9))).toBeFalsy();

        set.deleteAll(SudokuNumsCheckingSet.of(2, 6, 9));
        expectSetWithValues(set, [ 1, 7, 8 ]);
        expect(set.hasAll(SudokuNumsCheckingSet.of(7, 8))).toBeTruthy();
        expect(set.hasAll(SudokuNumsCheckingSet.of(1, 7, 8))).toBeTruthy();
        expect(set.hasAll(SudokuNumsCheckingSet.of(1, 9))).toBeFalsy();
        expect(set.hasAll(SudokuNumsCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(set.hasAll(SudokuNumsCheckingSet.of(1, 6, 7, 8, 9))).toBeFalsy();
        expect(set.doesNotHaveAny(SudokuNumsCheckingSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(SudokuNumsCheckingSet.of(8, 9))).toBeFalsy();
    });

    test('Checking with `has`', () => {
        const set = SudokuNumsCheckingSet.of(1, 6, 9);
        expect(set.has(1)).toBeTruthy();
        expect(set.has(2)).toBeFalsy();
        expect(set.has(3)).toBeFalsy();
        expect(set.has(4)).toBeFalsy();
        expect(set.has(5)).toBeFalsy();
        expect(set.has(6)).toBeTruthy();
        expect(set.has(7)).toBeFalsy();
        expect(set.has(8)).toBeFalsy();
        expect(set.has(9)).toBeTruthy();
    });

    test('Checking with `hasOnly`', () => {
        for (const num of SudokuNums.RANGE) {
            expect(SudokuNumsCheckingSet.of(num).hasOnly(num)).toBeTruthy();
        }
        expect(SudokuNumsCheckingSet.of(1, 6, 9).hasOnly(1)).toBeFalsy();
    });

    test('Checking with `delete`', () => {
        const set = SudokuNumsCheckingSet.of(1, 6, 9);
        expectSetWithValues(set.delete(6), [ 1, 9 ]);
        expectSetWithValues(set.delete(5), [ 1, 9 ]);
        expectSetWithValues(set.delete(1), [ 9 ]);
        expectSetWithValues(set.delete(9), []);
    });

    test('Checking with `doesNotHave`', () => {
        const set = SudokuNumsCheckingSet.of(1, 6, 9);
        expect(set.doesNotHave(1)).toBeFalsy();
        expect(set.doesNotHave(2)).toBeTruthy();
        expect(set.doesNotHave(3)).toBeTruthy();
        expect(set.doesNotHave(4)).toBeTruthy();
        expect(set.doesNotHave(5)).toBeTruthy();
        expect(set.doesNotHave(6)).toBeFalsy();
        expect(set.doesNotHave(7)).toBeTruthy();
        expect(set.doesNotHave(8)).toBeTruthy();
        expect(set.doesNotHave(9)).toBeFalsy();
    });

    test('Producing included numbers', () => {
        expect(SudokuNumsCheckingSet.of(1, 5, 9).nums()).toEqual([ 1, 5, 9 ]);
    });

    test('Uniting `SudokuNumsCheckingSet` with another `SudokuNumsCheckingSet`', () => {
        const original = SudokuNumsCheckingSet.of(1, 5, 9);
        const union = original.union(SudokuNumsCheckingSet.of(1, 5, 7));
        expect(union).toEqual(original);
        expectSetWithValues(union, [ 1, 5 ]);

        expectSetWithValues(SudokuNumsCheckingSet.of(1, 5, 9).union(SudokuNumsCheckingSet.of(1, 5, 9)),
            [ 1, 5, 9 ]);
        expectSetWithValues(SudokuNumsCheckingSet.of(1, 5, 9).union(SudokuNumsCheckingSet.of(2, 4, 8)), []);
    });

    test('Instance of `SudokuNumsCheckingSet` with remaining numbers', () => {
        expect(SudokuNumsCheckingSet.newEmpty().remaining.bitStore).toBe(
            SudokuNumsCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).bitStore
        );
        expect(SudokuNumsCheckingSet.of(1, 2, 3).remaining.bitStore).toBe(
            SudokuNumsCheckingSet.of(4, 5, 6, 7, 8, 9).bitStore
        );
        expect(SudokuNumsCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).remaining.bitStore).toBe(
            SudokuNumsCheckingSet.newEmpty().bitStore
        );
    });

    test('Checking equality', () => {
        expect(SudokuNumsCheckingSet.of(1, 9).equals(SudokuNumsCheckingSet.of(1, 9))).toBeTruthy();
        expect(SudokuNumsCheckingSet.of(1, 9).equals(SudokuNumsCheckingSet.of(1, 4))).toBeFalsy();
    });

    test('Cloning', () => {
        const original = SudokuNumsCheckingSet.of(1, 9);
        const cloned = original.clone();

        expect(cloned).not.toBe(original);

        original.addAll(SudokuNumsCheckingSet.of(8));
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(1, 9)); // ... does *not* change the clone

        cloned.deleteAll(SudokuNumsCheckingSet.of(1));
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // ... does *not* change the clone
    });

    test('Cloning using `clone`', () => {
        const original = SudokuNumsCheckingSet.of(1, 9);
        const cloned = original.clone();

        expect(cloned).not.toBe(original);

        original.addAll(SudokuNumsCheckingSet.of(8));
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(1, 9)); // ... does *not* change the clone

        cloned.deleteAll(SudokuNumsCheckingSet.of(1));
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // ... does *not* change the clone
    });

    test('Cloning using constructor', () => {
        const original = SudokuNumsCheckingSet.of(1, 9);
        const cloned = new SudokuNumsCheckingSet(original.bitStore);

        expect(cloned).not.toBe(original);

        original.addAll(SudokuNumsCheckingSet.of(8));
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(1, 9)); // ... does *not* change the clone

        cloned.deleteAll(SudokuNumsCheckingSet.of(1));
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // ... does *not* change the clone
    });

    const expectSetWithValues = (set: ReadonlySudokuNumsCheckingSet, values: ReadonlyArray<number>) => {
        expect(set.equals(new SudokuNumsCheckingSet(values))).toBeTruthy();
    };

});
