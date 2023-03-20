import { Cell } from '../../../../src/puzzle/cell';
import { CachedNumRanges } from '../../../../src/util/cachedNumRanges';
import { CellIndicesSet, ReadonlyCellIndicesSet } from '../../../../src/solver/sets';

describe('Unit tests for `CellIndicesSet`', () => {

    test('Construction of `CellIndicesSet` from array of numbers', () => {
        expectSetWithValues(new CellIndicesSet([ 1, 30, 75 ]), [ 1, 30, 75 ]);
    });

    test('Construction of `CellIndicesSet` using `of` static factory method', () => {
        expectSetWithValues(CellIndicesSet.of(1, 30, 75), [ 1, 30, 75 ]);
    });

    test('Construction of empty `CellIndicesSet` using `of` static factory method', () => {
        expectSetWithValues(CellIndicesSet.of(), []);
    });

    test('Construction of empty `CellIndicesSet` using `newEmpty` static factory method', () => {
        expectSetWithValues(CellIndicesSet.newEmpty(), []);
    });

    test('Adding and deleting many `Cell`s\' indices with `hasAll` and `doesNotHaveAny` checks', () => {
        const set = CellIndicesSet.of(1, 30, 75);

        expect(set.hasAll(CellIndicesSet.of(1, 30))).toBeTruthy();
        expect(set.hasAll(CellIndicesSet.of(30, 75))).toBeTruthy();
        expect(set.hasAll(CellIndicesSet.of(1, 30, 75))).toBeTruthy();
        expect(set.hasAll(CellIndicesSet.of(2, 75))).toBeFalsy();
        expect(set.doesNotHaveAny(CellIndicesSet.of(2, 40))).toBeTruthy();
        expect(set.doesNotHaveAny(CellIndicesSet.of(30, 40))).toBeFalsy();

        set.addAll(CellIndicesSet.of(0, 1, 7, 28, 80));
        expectSetWithValues(set, [ 0, 1, 7, 28, 30, 75, 80 ]);
        expect(set.hasAll(CellIndicesSet.of(0, 7))).toBeTruthy();
        expect(set.hasAll(CellIndicesSet.of(1, 7, 28, 80))).toBeTruthy();
        expect(set.hasAll(CellIndicesSet.of(1, 5))).toBeFalsy();
        expect(set.hasAll(CellIndicesSet.of(2, 6, 9))).toBeFalsy();
        expect(set.doesNotHaveAny(CellIndicesSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(CellIndicesSet.of(1, 9))).toBeFalsy();

        set.deleteAll(CellIndicesSet.of(1, 7, 30, 75));
        expectSetWithValues(set, [ 0, 28, 80 ]);
        expect(set.hasAll(CellIndicesSet.of(0, 28))).toBeTruthy();
        expect(set.hasAll(CellIndicesSet.of(0, 80))).toBeTruthy();
        expect(set.hasAll(CellIndicesSet.of(28, 80))).toBeTruthy();
        expect(set.hasAll(CellIndicesSet.of(0, 7))).toBeFalsy();
        expect(set.hasAll(CellIndicesSet.of(1, 7, 28, 80))).toBeFalsy();
        expect(set.doesNotHaveAny(CellIndicesSet.of(2, 3))).toBeTruthy();
        expect(set.doesNotHaveAny(CellIndicesSet.of(0, 9))).toBeFalsy();
    });

    test('Adding numbers one by one', () => {
        const set = CellIndicesSet.of(1, 30, 75);

        expectSetWithValues(set.add(0), [ 0, 1, 30, 75 ]);
        expectSetWithValues(set.add(30), [ 0, 1, 30, 75 ]);
        expectSetWithValues(set.add(31), [ 0, 1, 30, 31, 75 ]);
        expectSetWithValues(set.add(80), [ 0, 1, 30, 31, 75, 80 ]);
    });

    test('Deleting numbers one by one', () => {
        const set = CellIndicesSet.of(0, 1, 30, 31, 75, 80);

        expectSetWithValues(set.delete(0), [ 1, 30, 31, 75, 80 ]);
        expectSetWithValues(set.delete(31), [ 1, 30, 75, 80 ]);
        expectSetWithValues(set.delete(76), [ 1, 30, 75, 80 ]);
        expectSetWithValues(set.delete(80), [ 1, 30, 75 ]);
    });

    test('Checking with `doesNotHave`', () => {
        const set = CellIndicesSet.of(1, 30, 75);
        expect(set.doesNotHave(1)).toBeFalsy();
        expect(set.doesNotHave(2)).toBeTruthy();
        expect(set.doesNotHave(29)).toBeTruthy();
        expect(set.doesNotHave(30)).toBeFalsy();
        expect(set.doesNotHave(45)).toBeTruthy();
        expect(set.doesNotHave(75)).toBeFalsy();
        expect(set.doesNotHave(80)).toBeTruthy();
    });

    test('Producing included `Cell`s', () => {
        expect(CellIndicesSet.of(0, 46, 80).cells()).toEqual([
            Cell.at(0, 0), Cell.at(5, 1), Cell.at(8, 8)
        ]);
    });

    test('Uniting `CellIndicesSet` with another `CellIndicesSet`', () => {
        const original = CellIndicesSet.of(0, 46, 80);
        const union = original.union(CellIndicesSet.of(1, 46, 70, 80));
        expect(union).toBe(original);
        expectSetWithValues(union, [ 46, 80 ]);

        expectSetWithValues(CellIndicesSet.of(0, 46, 80).union(CellIndicesSet.of(0, 46, 80)),
            [ 0, 46, 80 ]);
        expectSetWithValues(CellIndicesSet.of(0, 46, 80).union(CellIndicesSet.of(2, 47, 75)), []);
    });

    test('Producing `NOT` set', () => {
        expectSetWithValues(new CellIndicesSet(CachedNumRanges.ZERO_TO_N_LTE_81[75]).not(), [
            75, 76, 77, 78, 79, 80
        ]);
    });

    test('Producing difference set', () => {
        expectSetWithValues(CellIndicesSet.of(1, 30, 75)._(CellIndicesSet.of(30, 75)), [ 1 ]);
    });

    test('Checking equality', () => {
        expect(CellIndicesSet.of(1, 75).equals(CellIndicesSet.of(1, 75))).toBeTruthy();
        expect(CellIndicesSet.of(1, 75).equals(CellIndicesSet.of(1, 30))).toBeFalsy();
    });

    test('Cloning using `clone`', () => {
        const original = CellIndicesSet.of(1, 30, 75);
        const cloned = original.clone();

        expect(cloned).not.toBe(original);

        original.addAll(CellIndicesSet.of(8));
        expect(original).toEqual(CellIndicesSet.of(1, 8, 30, 75)); // changing original ...
        expect(cloned).toEqual(CellIndicesSet.of(1, 30, 75)); // ... does *not* change the clone

        cloned.deleteAll(CellIndicesSet.of(1));
        expect(cloned).toEqual(CellIndicesSet.of(30, 75)); // changing a clone ...
        expect(original).toEqual(CellIndicesSet.of(1, 8, 30, 75)); // ... does *not* change the clone
    });

    test('Cloning using constructor', () => {
        const original = CellIndicesSet.of(1, 30, 75);
        const cloned = new CellIndicesSet(original);

        expect(cloned).not.toBe(original);

        original.addAll(CellIndicesSet.of(8));
        expect(original).toEqual(CellIndicesSet.of(1, 8, 30, 75)); // changing original ...
        expect(cloned).toEqual(CellIndicesSet.of(1, 30, 75)); // ... does *not* change the clone

        cloned.deleteAll(CellIndicesSet.of(1));
        expect(cloned).toEqual(CellIndicesSet.of(30, 75)); // changing a clone ...
        expect(original).toEqual(CellIndicesSet.of(1, 8, 30, 75)); // ... does *not* change the clone
    });

    const expectSetWithValues = (set: ReadonlyCellIndicesSet, values: ReadonlyArray<number>) => {
        expect(set.equals(new CellIndicesSet(values))).toBeTruthy();
    };

});
