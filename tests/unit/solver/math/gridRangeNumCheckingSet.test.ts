import * as _ from 'lodash';
import { Grid } from '../../../../src/puzzle/grid';
import { GridRangeNumCheckingSet } from '../../../../src/solver/math';

describe('Unit tests for `GridRangeNumCheckingSet`', () => {
    test('Construction of `GridRangeNumCheckingSet` using `of` static factory method', () => {
        expectNumCheckingSetWithValues(GridRangeNumCheckingSet.of(1, 30, 75), [ 1, 30, 75 ]);
    });

    test('Adding and removing numbers with `hasAll` and `doesNotHaveAny` checks', () => {
        const numSet = GridRangeNumCheckingSet.of(1, 30, 75);

        expect(numSet.hasAll(GridRangeNumCheckingSet.of(1, 30))).toBeTruthy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(30, 75))).toBeTruthy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(1, 30, 75))).toBeTruthy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(2, 75))).toBeFalsy();
        expect(numSet.doesNotHaveAny(GridRangeNumCheckingSet.of(2, 40))).toBeTruthy();
        expect(numSet.doesNotHaveAny(GridRangeNumCheckingSet.of(30, 40))).toBeFalsy();

        numSet.add(GridRangeNumCheckingSet.of(0, 1, 7, 28, 80));
        expectNumCheckingSetWithValues(numSet, [ 0, 1, 7, 28, 30, 75, 80 ]);
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(0, 7))).toBeTruthy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(1, 7, 28, 80))).toBeTruthy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(1, 5))).toBeFalsy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(2, 6, 9))).toBeFalsy();
        expect(numSet.doesNotHaveAny(GridRangeNumCheckingSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(GridRangeNumCheckingSet.of(1, 9))).toBeFalsy();

        numSet.remove(GridRangeNumCheckingSet.of(1, 7, 30, 75));
        expectNumCheckingSetWithValues(numSet, [ 0, 28, 80 ]);
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(0, 28))).toBeTruthy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(0, 80))).toBeTruthy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(28, 80))).toBeTruthy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(0, 7))).toBeFalsy();
        expect(numSet.hasAll(GridRangeNumCheckingSet.of(1, 7, 28, 80))).toBeFalsy();
        expect(numSet.doesNotHaveAny(GridRangeNumCheckingSet.of(2, 3))).toBeTruthy();
        expect(numSet.doesNotHaveAny(GridRangeNumCheckingSet.of(0, 9))).toBeFalsy();
    });

    const expectNumCheckingSetWithValues = (numSet: GridRangeNumCheckingSet, values: ReadonlyArray<number>) => {
        const set = new Set(values);
        _.range(0, Grid.CELL_COUNT).forEach(num => {
            expect(numSet.hasAll(GridRangeNumCheckingSet.of(num))).toBe(set.has(num));
        });
    };
});
