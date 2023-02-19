import { SudokuNumsCheckingSet, ReadonlySudokuNumsCheckingSet } from '../../../../src/solver/math/sudokuNumsCheckingSet';

describe('Unit tests for `SudokuNumsCheckingSet`', () => {
    test('Construction of `SudokuNumsCheckingSet` from array of numbers', () => {
        expectSetWithValues(new SudokuNumsCheckingSet([ 1, 6, 9 ]), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsCheckingSet` from `BitStore32`', () => {
        expectSetWithValues(new SudokuNumsCheckingSet(1 << 1 | 1 << 6 | 1 << 9), [ 1, 6, 9 ]);
    });

    test('Construction of `SudokuNumsCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(SudokuNumsCheckingSet.of(2, 4, 5), [ 2, 4, 5 ]);
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

    test('Instance of `SudokuNumsCheckingSet` with remaining numbers', () => {
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

    test('Checking equality', () => {
        expect(SudokuNumsCheckingSet.of(1, 9).equals(SudokuNumsCheckingSet.of(1, 9))).toBeTruthy();
        expect(SudokuNumsCheckingSet.of(1, 9).equals(SudokuNumsCheckingSet.of(1, 4))).toBeFalsy();
    });

    test('Cloning', () => {
        const original = SudokuNumsCheckingSet.of(1, 9);
        const cloned = original.clone();

        expect(cloned).not.toBe(original);

        original.add(SudokuNumsCheckingSet.of(8));
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(1, 9)); // ... does NOT change the clone

        cloned.remove(SudokuNumsCheckingSet.of(1));
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // ... does NOT change the clone
    });

    test('Cloning using `clone`', () => {
        const original = SudokuNumsCheckingSet.of(1, 9);
        const cloned = original.clone();

        expect(cloned).not.toBe(original);

        original.add(SudokuNumsCheckingSet.of(8));
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(1, 9)); // ... does NOT change the clone

        cloned.remove(SudokuNumsCheckingSet.of(1));
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // ... does NOT change the clone
    });

    test('Cloning using constructor', () => {
        const original = SudokuNumsCheckingSet.of(1, 9);
        const cloned = new SudokuNumsCheckingSet(original.bitStore);

        expect(cloned).not.toBe(original);

        original.add(SudokuNumsCheckingSet.of(8));
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // changing original ...
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(1, 9)); // ... does NOT change the clone

        cloned.remove(SudokuNumsCheckingSet.of(1));
        expect(cloned).toEqual(SudokuNumsCheckingSet.of(9)); // changing a clone ...
        expect(original).toEqual(SudokuNumsCheckingSet.of(1, 8, 9)); // ... does NOT change the clone
    });

    const expectSetWithValues = (numsCheckingSet: ReadonlySudokuNumsCheckingSet, values: ReadonlyArray<number>) => {
        expect(numsCheckingSet.equals(new SudokuNumsCheckingSet(values))).toBeTruthy();
    };
});
