import * as _ from 'lodash';
import { CellRowAndColumn, Grid } from '../../../src/puzzle/grid';

describe('Unit tests for `Grid`', () => {

    test('Amount of Cells on Grid\'s side is 9', () => {
        expect(Grid.SIDE_CELL_COUNT).toEqual(9);
    });

    test('Range for `Grid`\'s side indices is [0, 8]', () => {
        expect(Grid.SIDE_INDICES_RANGE).toEqual([ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]);
    });

    test('Grid has 81 Cells', () => {
        expect(Grid.CELL_COUNT).toEqual(81);
    });

    test('Range for `Grid`\'s `Cell` indices is [0, 80]', () => {
        expect(Grid.CELL_INDICES_RANGE).toEqual(_.range(Grid.CELL_COUNT));
    });

    test('Sum of all `Cell`s in the `Grid` add up to 405', () => {
        expect(Grid.SUM).toEqual(405);
    });

    test('Iteration over `CellRowAndColumn`s', () => {
        const cells = new Array<CellRowAndColumn>();
        Grid.forEachCellPosition(cellPosition => {
            cells.push(cellPosition);
        });

        expect(cells).toEqual([
            [ 0, 0 ], [ 0, 1 ], [ 0, 2 ], [ 0, 3 ], [ 0, 4 ], [ 0, 5 ], [ 0, 6 ], [ 0, 7 ], [ 0, 8 ],
            [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 1, 3 ], [ 1, 4 ], [ 1, 5 ], [ 1, 6 ], [ 1, 7 ], [ 1, 8 ],
            [ 2, 0 ], [ 2, 1 ], [ 2, 2 ], [ 2, 3 ], [ 2, 4 ], [ 2, 5 ], [ 2, 6 ], [ 2, 7 ], [ 2, 8 ],
            [ 3, 0 ], [ 3, 1 ], [ 3, 2 ], [ 3, 3 ], [ 3, 4 ], [ 3, 5 ], [ 3, 6 ], [ 3, 7 ], [ 3, 8 ],
            [ 4, 0 ], [ 4, 1 ], [ 4, 2 ], [ 4, 3 ], [ 4, 4 ], [ 4, 5 ], [ 4, 6 ], [ 4, 7 ], [ 4, 8 ],
            [ 5, 0 ], [ 5, 1 ], [ 5, 2 ], [ 5, 3 ], [ 5, 4 ], [ 5, 5 ], [ 5, 6 ], [ 5, 7 ], [ 5, 8 ],
            [ 6, 0 ], [ 6, 1 ], [ 6, 2 ], [ 6, 3 ], [ 6, 4 ], [ 6, 5 ], [ 6, 6 ], [ 6, 7 ], [ 6, 8 ],
            [ 7, 0 ], [ 7, 1 ], [ 7, 2 ], [ 7, 3 ], [ 7, 4 ], [ 7, 5 ], [ 7, 6 ], [ 7, 7 ], [ 7, 8 ],
            [ 8, 0 ], [ 8, 1 ], [ 8, 2 ], [ 8, 3 ], [ 8, 4 ], [ 8, 5 ], [ 8, 6 ], [ 8, 7 ], [ 8, 8 ]
        ]);
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
