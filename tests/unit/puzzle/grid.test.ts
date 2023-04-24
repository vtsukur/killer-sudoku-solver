import * as _ from 'lodash';
import { Grid } from '../../../src/puzzle/grid';

describe('Unit tests for `Grid`', () => {

    test('Amount of `Cell`s on the Grid\'s side is `9`', () => {
        expect(Grid.SIDE_CELL_COUNT).toEqual(9);
    });

    test('Range of `Grid`\'s side indices is `[0, 8]`', () => {
        expect(Grid.SIDE_INDICES).toEqual([ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]);
    });

    test('Grid has `81` Cells', () => {
        expect(Grid.CELL_COUNT).toEqual(81);
    });

    test('Range of all `Grid`\'s `Cell` indices is `[0, 80]`', () => {
        expect(Grid.CELL_INDICES).toEqual(_.range(Grid.CELL_COUNT));
    });

    test('Sum of all `Cell`s in the `Grid` add up to `405`', () => {
        expect(Grid.SUM).toEqual(405);
    });

    test('Integer next to the sum of all `Cell`s in the `Grid` is `406`', () => {
        expect(Grid.SUM_RANGE_INCSLUSIVE_UPPER_BOUND).toEqual(406);
    });

    test('Creation of `GridMatrix`', () => {
        const matrix = Grid.newMatrix();

        expect(matrix.length).toBe(Grid.SIDE_CELL_COUNT);
        for (const row of matrix) {
            expect(row.length).toBe(Grid.SIDE_CELL_COUNT);
            for (const el of row) {
                expect(el).toBeUndefined();
            }
        }
    });

});
