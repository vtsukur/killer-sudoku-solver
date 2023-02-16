import * as _ from 'lodash';
import { Grid } from '../../../../src/puzzle/grid';
import { CellIndexNumsCheckingSet } from '../../../../src/solver/math';

describe('Unit tests for `CellIndexNumsCheckingSet`', () => {
    test('Construction of `CellIndexNumsCheckingSet` using `of` static factory method', () => {
        expectNumCheckingSetWithValues(CellIndexNumsCheckingSet.of(1, 30, 75), [ 1, 30, 75 ]);
    });

    test('Adding and removing numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const numSet = CellIndexNumsCheckingSet.of(1, 30, 75);

        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(1, 30))).toBeTruthy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(30, 75))).toBeTruthy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(1, 30, 75))).toBeTruthy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(2, 75))).toBeFalsy();
        expect(numSet.doesNotHaveAny(CellIndexNumsCheckingSet.of(2, 40))).toBeTruthy();
        expect(numSet.doesNotHaveAny(CellIndexNumsCheckingSet.of(30, 40))).toBeFalsy();

        numSet.add(CellIndexNumsCheckingSet.of(0, 1, 7, 28, 80));
        expectNumCheckingSetWithValues(numSet, [ 0, 1, 7, 28, 30, 75, 80 ]);
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(0, 7))).toBeTruthy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(1, 7, 28, 80))).toBeTruthy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(1, 5))).toBeFalsy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(numSet.doesNotHaveAny(CellIndexNumsCheckingSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(CellIndexNumsCheckingSet.of(1, 9))).toBeFalsy();

        numSet.remove(CellIndexNumsCheckingSet.of(1, 7, 30, 75));
        expectNumCheckingSetWithValues(numSet, [ 0, 28, 80 ]);
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(0, 28))).toBeTruthy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(0, 80))).toBeTruthy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(28, 80))).toBeTruthy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(0, 7))).toBeFalsy();
        expect(numSet.hasAll(CellIndexNumsCheckingSet.of(1, 7, 28, 80))).toBeFalsy();
        expect(numSet.doesNotHaveAny(CellIndexNumsCheckingSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(CellIndexNumsCheckingSet.of(0, 9))).toBeFalsy();
    });

    const expectNumCheckingSetWithValues = (numSet: CellIndexNumsCheckingSet, values: ReadonlyArray<number>) => {
        const set = new Set(values);
        _.range(0, Grid.CELL_COUNT).forEach(num => {
            expect(numSet.hasAll(CellIndexNumsCheckingSet.of(num))).toBe(set.has(num));
        });
    };
});
