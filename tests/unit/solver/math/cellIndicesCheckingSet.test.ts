import { CellIndicesCheckingSet } from '../../../../src/solver/math';

describe('Unit tests for `CellIndicesCheckingSet`', () => {
    test('Construction of `SudokuNumsCheckingSet` from array of numbers', () => {
        expectSetWithValues(new CellIndicesCheckingSet([ 1, 30, 75 ]), [ 1, 30, 75 ]);
    });

    test('Construction of `CellIndicesCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(CellIndicesCheckingSet.of(1, 30, 75), [ 1, 30, 75 ]);
    });

    test('Construction of empty `CellIndicesCheckingSet` using constructor', () => {
        expectSetWithValues(new CellIndicesCheckingSet(), []);
    });

    test('Construction of empty `CellIndicesCheckingSet` using `of` static factory method', () => {
        expectSetWithValues(CellIndicesCheckingSet.of(), []);
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

    test('Checking equality', () => {
        expect(CellIndicesCheckingSet.of(1, 75).equals(CellIndicesCheckingSet.of(1, 75))).toBeTruthy();
        expect(CellIndicesCheckingSet.of(1, 75).equals(CellIndicesCheckingSet.of(1, 30))).toBeFalsy();
    });

    const expectSetWithValues = (numsCheckingSet: CellIndicesCheckingSet, values: ReadonlyArray<number>) => {
        expect(numsCheckingSet.equals(new CellIndicesCheckingSet(values))).toBeTruthy();
    };
});