import { SudokuNums } from '../../../../src/puzzle/sudokuNums';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../../../src/solver/sets';

describe('Unit tests for `SudokuNumsSet`', () => {

    test('Construction of `SudokuNumsSet` from array of numbers', () => {
        expectSetWithValues(new SudokuNumsSet([ 1, 6, 9 ]), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsSet` from another set', () => {
        expectSetWithValues(new SudokuNumsSet(new SudokuNumsSet([ 1, 6, 9 ])), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsSet` from `BitStore32`', () => {
        expectSetWithValues(new SudokuNumsSet(1 << 1 | 1 << 6 | 1 << 9), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsSet` using `of` static factory method', () => {
        expectSetWithValues(SudokuNumsSet.of(2, 4, 5), [ 2, 4, 5 ]);
    });

    test('Construction of `SudokuNumsSet` with a single number using `ofSingle` static factory method', () => {
        expectSetWithValues(SudokuNumsSet.of(3), [ 3 ]);
    });

    test('Construction of empty `SudokuNumsSet` using `of` static factory method', () => {
        expectSetWithValues(SudokuNumsSet.of(), []);
    });

    test('Construction of empty `SudokuNumsSet` using `newEmpty` static factory method', () => {
        expectSetWithValues(SudokuNumsSet.newEmpty(), []);
    });

    test('Construction of `SudokuNumsSet` with all numbers using `all` static factory method', () => {
        expectSetWithValues(SudokuNumsSet.all(), [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
    });

    test('Adding and deleting many numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const set = SudokuNumsSet.of(1, 6, 9);
        expect(set.hasAll(SudokuNumsSet.of(1, 6))).toBeTruthy();
        expect(set.doesNotHaveAny(SudokuNumsSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(SudokuNumsSet.of(8, 9))).toBeFalsy();

        set.addAll(SudokuNumsSet.of(1, 7, 8));
        expectSetWithValues(set, [ 1, 6, 7, 8, 9 ]);
        expect(set.hasAll(SudokuNumsSet.of(1, 6))).toBeTruthy();
        expect(set.hasAll(SudokuNumsSet.of(7, 8, 9))).toBeTruthy();
        expect(set.hasAll(SudokuNumsSet.of(1, 6, 7, 8, 9))).toBeTruthy();
        expect(set.hasAll(SudokuNumsSet.of(1, 5))).toBeFalsy();
        expect(set.hasAll(SudokuNumsSet.of(2, 6, 9))).toBeFalsy();
        expect(set.doesNotHaveAny(SudokuNumsSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(SudokuNumsSet.of(5, 9))).toBeFalsy();

        set.deleteAll(SudokuNumsSet.of(2, 6, 9));
        expectSetWithValues(set, [ 1, 7, 8 ]);
        expect(set.hasAll(SudokuNumsSet.of(7, 8))).toBeTruthy();
        expect(set.hasAll(SudokuNumsSet.of(1, 7, 8))).toBeTruthy();
        expect(set.hasAll(SudokuNumsSet.of(1, 9))).toBeFalsy();
        expect(set.hasAll(SudokuNumsSet.of(2, 6, 9))).toBeFalsy();
        expect(set.hasAll(SudokuNumsSet.of(1, 6, 7, 8, 9))).toBeFalsy();
        expect(set.doesNotHaveAny(SudokuNumsSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(SudokuNumsSet.of(8, 9))).toBeFalsy();
    });

    test('Checking with `has`', () => {
        const set = SudokuNumsSet.of(1, 6, 9);
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
            expect(SudokuNumsSet.of(num).hasOnly(num)).toBeTruthy();
        }
        expect(SudokuNumsSet.of(1, 6, 9).hasOnly(1)).toBeFalsy();
    });

    test('Checking with `delete`', () => {
        const set = SudokuNumsSet.of(1, 6, 9);
        expectSetWithValues(set.delete(6), [ 1, 9 ]);
        expectSetWithValues(set.delete(5), [ 1, 9 ]);
        expectSetWithValues(set.delete(1), [ 9 ]);
        expectSetWithValues(set.delete(9), []);
    });

    test('Checking with `doesNotHave`', () => {
        const set = SudokuNumsSet.of(1, 6, 9);
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
        expect(SudokuNumsSet.of(1, 5, 9).nums()).toEqual([ 1, 5, 9 ]);
    });

    test('Uniting `SudokuNumsSet` with another `SudokuNumsSet`', () => {
        const original = SudokuNumsSet.of(1, 5, 9);
        const union = original.union(SudokuNumsSet.of(1, 5, 7));
        expect(union).toEqual(original);
        expectSetWithValues(union, [ 1, 5 ]);

        expectSetWithValues(SudokuNumsSet.of(1, 5, 9).union(SudokuNumsSet.of(1, 5, 9)),
            [ 1, 5, 9 ]);
        expectSetWithValues(SudokuNumsSet.of(1, 5, 9).union(SudokuNumsSet.of(2, 4, 8)), []);
    });

    test('Instance of `SudokuNumsSet` with remaining numbers', () => {
        expect(SudokuNumsSet.newEmpty().remaining.bitStore).toBe(
            SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).bitStore
        );
        expect(SudokuNumsSet.of(1, 2, 3).remaining.bitStore).toBe(
            SudokuNumsSet.of(4, 5, 6, 7, 8, 9).bitStore
        );
        expect(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).remaining.bitStore).toBe(
            SudokuNumsSet.newEmpty().bitStore
        );
    });

    test('Checking equality', () => {
        expect(SudokuNumsSet.of(1, 9).equals(SudokuNumsSet.of(1, 9))).toBeTruthy();
        expect(SudokuNumsSet.of(1, 9).equals(SudokuNumsSet.of(1, 4))).toBeFalsy();
    });

    test('Cloning', () => {
        const original = SudokuNumsSet.of(1, 9);
        const cloned = original.clone();

        expect(cloned).not.toBe(original);

        original.addAll(SudokuNumsSet.of(8));
        expect(original).toEqual(SudokuNumsSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsSet.of(1, 9)); // ... does *not* change the clone

        cloned.deleteAll(SudokuNumsSet.of(1));
        expect(cloned).toEqual(SudokuNumsSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsSet.of(1, 8, 9)); // ... does *not* change the clone
    });

    test('Cloning using `clone`', () => {
        const original = SudokuNumsSet.of(1, 9);
        const cloned = original.clone();

        expect(cloned).not.toBe(original);

        original.addAll(SudokuNumsSet.of(8));
        expect(original).toEqual(SudokuNumsSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsSet.of(1, 9)); // ... does *not* change the clone

        cloned.deleteAll(SudokuNumsSet.of(1));
        expect(cloned).toEqual(SudokuNumsSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsSet.of(1, 8, 9)); // ... does *not* change the clone
    });

    test('Cloning using constructor', () => {
        const original = SudokuNumsSet.of(1, 9);
        const cloned = new SudokuNumsSet(original.bitStore);

        expect(cloned).not.toBe(original);

        original.addAll(SudokuNumsSet.of(8));
        expect(original).toEqual(SudokuNumsSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsSet.of(1, 9)); // ... does *not* change the clone

        cloned.deleteAll(SudokuNumsSet.of(1));
        expect(cloned).toEqual(SudokuNumsSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsSet.of(1, 8, 9)); // ... does *not* change the clone
    });

    const expectSetWithValues = (set: ReadonlySudokuNumsSet, values: ReadonlyArray<number>) => {
        expect(set.equals(new SudokuNumsSet(values))).toBeTruthy();
    };

});
