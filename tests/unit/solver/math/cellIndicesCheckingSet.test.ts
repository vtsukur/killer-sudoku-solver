import { Cell } from '../../../../src/puzzle/cell';
import { CellIndicesCheckingSet, ReadonlyCellIndicesCheckingSet } from '../../../../src/solver/math';
import { CachedNumRanges } from '../../../../src/solver/math/cachedNumRanges';

describe('Unit tests for `CellIndicesCheckingSet`', () => {
    test('Construction of `SudokuNumsCheckingSet` from array of numbers', () => {
        expectSetWithValues(new CellIndicesCheckingSet([ 1, 30, 75 ]), [ 1, 30, 75 ]);
    });

    test('Construction of `CellIndicesCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(CellIndicesCheckingSet.of(1, 30, 75), [ 1, 30, 75 ]);
    });

    test('Construction of empty `CellIndicesCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(CellIndicesCheckingSet.of(), []);
    });

    test('Construction of empty `CellIndicesCheckingSet` using `newEmpty` static factory method', () => {
        expectSetWithValues(CellIndicesCheckingSet.newEmpty(), []);
    });

    test('Adding and removing numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const numsCheckingSet = CellIndicesCheckingSet.of(1, 30, 75);

        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(1, 30))).toBeTruthy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(30, 75))).toBeTruthy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(1, 30, 75))).toBeTruthy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(2, 75))).toBeFalsy();
        expect(numsCheckingSet.doesNotHaveAny(CellIndicesCheckingSet.of(2, 40))).toBeTruthy();
        expect(numsCheckingSet.doesNotHaveAny(CellIndicesCheckingSet.of(30, 40))).toBeFalsy();

        numsCheckingSet.add(CellIndicesCheckingSet.of(0, 1, 7, 28, 80));
        expectSetWithValues(numsCheckingSet, [ 0, 1, 7, 28, 30, 75, 80 ]);
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(0, 7))).toBeTruthy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(1, 7, 28, 80))).toBeTruthy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(1, 5))).toBeFalsy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(numsCheckingSet.doesNotHaveAny(CellIndicesCheckingSet.of(2, 3))).toBeTruthy();
        expect(numsCheckingSet.doesNotHaveAny(CellIndicesCheckingSet.of(1, 9))).toBeFalsy();

        numsCheckingSet.remove(CellIndicesCheckingSet.of(1, 7, 30, 75));
        expectSetWithValues(numsCheckingSet, [ 0, 28, 80 ]);
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(0, 28))).toBeTruthy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(0, 80))).toBeTruthy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(28, 80))).toBeTruthy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(0, 7))).toBeFalsy();
        expect(numsCheckingSet.hasAll(CellIndicesCheckingSet.of(1, 7, 28, 80))).toBeFalsy();
        expect(numsCheckingSet.doesNotHaveAny(CellIndicesCheckingSet.of(2, 3))).toBeTruthy();
        expect(numsCheckingSet.doesNotHaveAny(CellIndicesCheckingSet.of(0, 9))).toBeFalsy();
    });

    test('Adding numbers one by one', () => {
        const numsCheckingSet = CellIndicesCheckingSet.of(1, 30, 75);

        numsCheckingSet.addOne(0);
        numsCheckingSet.addOne(31);
        numsCheckingSet.addOne(80);

        expectSetWithValues(numsCheckingSet, [ 0, 1, 30, 31, 75, 80 ]);
    });

    test('Removing numbers one by one', () => {
        const numsCheckingSet = CellIndicesCheckingSet.of(0, 1, 30, 31, 75, 80);

        numsCheckingSet.removeOne(0);
        numsCheckingSet.removeOne(31);
        numsCheckingSet.removeOne(80);

        expectSetWithValues(numsCheckingSet, [ 1, 30, 75 ]);
    });

    test('Checking with `doesNotHave`', () => {
        const numsCheckingSet = CellIndicesCheckingSet.of(1, 30, 75);
        expect(numsCheckingSet.doesNotHave(1)).toBeFalsy();
        expect(numsCheckingSet.doesNotHave(2)).toBeTruthy();
        expect(numsCheckingSet.doesNotHave(29)).toBeTruthy();
        expect(numsCheckingSet.doesNotHave(30)).toBeFalsy();
        expect(numsCheckingSet.doesNotHave(45)).toBeTruthy();
        expect(numsCheckingSet.doesNotHave(75)).toBeFalsy();
        expect(numsCheckingSet.doesNotHave(80)).toBeTruthy();
    });

    test('Producing included `Cell`s', () => {
        expect(CellIndicesCheckingSet.of(0, 46, 80).cells()).toEqual([
            Cell.at(0, 0), Cell.at(5, 1), Cell.at(8, 8)
        ]);
    });

    test('Producing `AND` for two sets', () => {
        const one = CellIndicesCheckingSet.of(0, 46, 80);
        const second = CellIndicesCheckingSet.of(1, 46, 70, 80);
        expectSetWithValues(one.and(second), [ 46, 80 ]);
    });

    test('Producing `NOT` set', () => {
        expectSetWithValues(new CellIndicesCheckingSet(CachedNumRanges.ZERO_TO_N_LTE_81[75]).not(), [
            75, 76, 77, 78, 79, 80
        ]);
    });

    test('Producing difference set', () => {
        expectSetWithValues(CellIndicesCheckingSet.of(1, 30, 75)._(CellIndicesCheckingSet.of(30, 75)), [ 1 ]);
    });

    test('Checking equality', () => {
        expect(CellIndicesCheckingSet.of(1, 75).equals(CellIndicesCheckingSet.of(1, 75))).toBeTruthy();
        expect(CellIndicesCheckingSet.of(1, 75).equals(CellIndicesCheckingSet.of(1, 30))).toBeFalsy();
    });

    test('Cloning using `clone`', () => {
        const original = CellIndicesCheckingSet.of(1, 30, 75);
        const cloned = original.clone();

        expect(cloned).not.toBe(original);

        original.add(CellIndicesCheckingSet.of(8));
        expect(original).toEqual(CellIndicesCheckingSet.of(1, 8, 30, 75)); // changing original ...
        expect(cloned).toEqual(CellIndicesCheckingSet.of(1, 30, 75)); // ... does NOT change the clone

        cloned.remove(CellIndicesCheckingSet.of(1));
        expect(cloned).toEqual(CellIndicesCheckingSet.of(30, 75)); // changing a clone ...
        expect(original).toEqual(CellIndicesCheckingSet.of(1, 8, 30, 75)); // ... does NOT change the clone
    });

    test('Cloning using constructor', () => {
        const original = CellIndicesCheckingSet.of(1, 30, 75);
        const cloned = new CellIndicesCheckingSet(original);

        expect(cloned).not.toBe(original);

        original.add(CellIndicesCheckingSet.of(8));
        expect(original).toEqual(CellIndicesCheckingSet.of(1, 8, 30, 75)); // changing original ...
        expect(cloned).toEqual(CellIndicesCheckingSet.of(1, 30, 75)); // ... does NOT change the clone

        cloned.remove(CellIndicesCheckingSet.of(1));
        expect(cloned).toEqual(CellIndicesCheckingSet.of(30, 75)); // changing a clone ...
        expect(original).toEqual(CellIndicesCheckingSet.of(1, 8, 30, 75)); // ... does NOT change the clone
    });

    const expectSetWithValues = (numsCheckingSet: ReadonlyCellIndicesCheckingSet, values: ReadonlyArray<number>) => {
        expect(numsCheckingSet.equals(new CellIndicesCheckingSet(values))).toBeTruthy();
    };
});
