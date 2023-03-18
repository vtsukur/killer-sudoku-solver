import { Cell } from '../../../../src/puzzle/cell';
import { CachedNumRanges } from '../../../../src/solver/math/cachedNumRanges';
import { CellIndicesCheckingSet, ReadonlyCellIndicesCheckingSet } from '../../../../src/solver/sets';

describe('Unit tests for `CellIndicesCheckingSet`', () => {

    test('Construction of `CellIndicesCheckingSet` from array of numbers', () => {
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

    test('Adding and deleting many `Cell`s\' indices with `hasAll` and `doesNotHaveAny` checks', () => {
        const set = CellIndicesCheckingSet.of(1, 30, 75);

        expect(set.hasAll(CellIndicesCheckingSet.of(1, 30))).toBeTruthy();
        expect(set.hasAll(CellIndicesCheckingSet.of(30, 75))).toBeTruthy();
        expect(set.hasAll(CellIndicesCheckingSet.of(1, 30, 75))).toBeTruthy();
        expect(set.hasAll(CellIndicesCheckingSet.of(2, 75))).toBeFalsy();
        expect(set.doesNotHaveAny(CellIndicesCheckingSet.of(2, 40))).toBeTruthy();
        expect(set.doesNotHaveAny(CellIndicesCheckingSet.of(30, 40))).toBeFalsy();

        set.addAll(CellIndicesCheckingSet.of(0, 1, 7, 28, 80));
        expectSetWithValues(set, [ 0, 1, 7, 28, 30, 75, 80 ]);
        expect(set.hasAll(CellIndicesCheckingSet.of(0, 7))).toBeTruthy();
        expect(set.hasAll(CellIndicesCheckingSet.of(1, 7, 28, 80))).toBeTruthy();
        expect(set.hasAll(CellIndicesCheckingSet.of(1, 5))).toBeFalsy();
        expect(set.hasAll(CellIndicesCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(set.doesNotHaveAny(CellIndicesCheckingSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(CellIndicesCheckingSet.of(1, 9))).toBeFalsy();

        set.deleteAll(CellIndicesCheckingSet.of(1, 7, 30, 75));
        expectSetWithValues(set, [ 0, 28, 80 ]);
        expect(set.hasAll(CellIndicesCheckingSet.of(0, 28))).toBeTruthy();
        expect(set.hasAll(CellIndicesCheckingSet.of(0, 80))).toBeTruthy();
        expect(set.hasAll(CellIndicesCheckingSet.of(28, 80))).toBeTruthy();
        expect(set.hasAll(CellIndicesCheckingSet.of(0, 7))).toBeFalsy();
        expect(set.hasAll(CellIndicesCheckingSet.of(1, 7, 28, 80))).toBeFalsy();
        expect(set.doesNotHaveAny(CellIndicesCheckingSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(CellIndicesCheckingSet.of(0, 9))).toBeFalsy();
    });

    test('Adding numbers one by one', () => {
        const set = CellIndicesCheckingSet.of(1, 30, 75);

        set.addOne(0);
        set.addOne(31);
        set.addOne(80);

        expectSetWithValues(set, [ 0, 1, 30, 31, 75, 80 ]);
    });

    test('Deleting numbers one by one', () => {
        const set = CellIndicesCheckingSet.of(0, 1, 30, 31, 75, 80);

        set.deleteOne(0);
        set.deleteOne(31);
        set.deleteOne(80);

        expectSetWithValues(set, [ 1, 30, 75 ]);
    });

    test('Checking with `doesNotHave`', () => {
        const set = CellIndicesCheckingSet.of(1, 30, 75);
        expect(set.doesNotHave(1)).toBeFalsy();
        expect(set.doesNotHave(2)).toBeTruthy();
        expect(set.doesNotHave(29)).toBeTruthy();
        expect(set.doesNotHave(30)).toBeFalsy();
        expect(set.doesNotHave(45)).toBeTruthy();
        expect(set.doesNotHave(75)).toBeFalsy();
        expect(set.doesNotHave(80)).toBeTruthy();
    });

    test('Producing included `Cell`s', () => {
        expect(CellIndicesCheckingSet.of(0, 46, 80).cells()).toEqual([
            Cell.at(0, 0), Cell.at(5, 1), Cell.at(8, 8)
        ]);
    });

    test('Uniting `CellIndicesCheckingSet` with another `CellIndicesCheckingSet`', () => {
        const original = CellIndicesCheckingSet.of(0, 46, 80);
        const union = original.union(CellIndicesCheckingSet.of(1, 46, 70, 80));
        expect(union).toBe(original);
        expectSetWithValues(union, [ 46, 80 ]);

        expectSetWithValues(CellIndicesCheckingSet.of(0, 46, 80).union(CellIndicesCheckingSet.of(0, 46, 80)),
            [ 0, 46, 80 ]);
        expectSetWithValues(CellIndicesCheckingSet.of(0, 46, 80).union(CellIndicesCheckingSet.of(2, 47, 75)), []);
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

        original.addAll(CellIndicesCheckingSet.of(8));
        expect(original).toEqual(CellIndicesCheckingSet.of(1, 8, 30, 75)); // changing original ...
        expect(cloned).toEqual(CellIndicesCheckingSet.of(1, 30, 75)); // ... does *not* change the clone

        cloned.deleteAll(CellIndicesCheckingSet.of(1));
        expect(cloned).toEqual(CellIndicesCheckingSet.of(30, 75)); // changing a clone ...
        expect(original).toEqual(CellIndicesCheckingSet.of(1, 8, 30, 75)); // ... does *not* change the clone
    });

    test('Cloning using constructor', () => {
        const original = CellIndicesCheckingSet.of(1, 30, 75);
        const cloned = new CellIndicesCheckingSet(original);

        expect(cloned).not.toBe(original);

        original.addAll(CellIndicesCheckingSet.of(8));
        expect(original).toEqual(CellIndicesCheckingSet.of(1, 8, 30, 75)); // changing original ...
        expect(cloned).toEqual(CellIndicesCheckingSet.of(1, 30, 75)); // ... does *not* change the clone

        cloned.deleteAll(CellIndicesCheckingSet.of(1));
        expect(cloned).toEqual(CellIndicesCheckingSet.of(30, 75)); // changing a clone ...
        expect(original).toEqual(CellIndicesCheckingSet.of(1, 8, 30, 75)); // ... does *not* change the clone
    });

    const expectSetWithValues = (set: ReadonlyCellIndicesCheckingSet, values: ReadonlyArray<number>) => {
        expect(set.equals(new CellIndicesCheckingSet(values))).toBeTruthy();
    };

});
