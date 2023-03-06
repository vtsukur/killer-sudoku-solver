import * as _ from 'lodash';
import { Cell } from '../../../src/puzzle/cell';
import { CellRowAndColumn, GridMatrix } from '../../../src/puzzle/gridMatrix';

describe('Unit tests for `GridMatrix`', () => {
    test('Amount of Cells on Grid\'s side is 9', () => {
        expect(GridMatrix.SIDE_CELL_COUNT).toEqual(9);
    });

    test('Range for `Grid`\'s side indices is [0, 8]', () => {
        expect(GridMatrix.SIDE_INDICES_RANGE).toEqual([ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]);
    });

    test('Grid has 81 Cells', () => {
        expect(GridMatrix.CELL_COUNT).toEqual(81);
    });

    test('Range for `Grid`\'s `Cell` indices is [0, 80]', () => {
        expect(GridMatrix.CELL_INDICES_RANGE).toEqual(_.range(GridMatrix.CELL_COUNT));
    });

    test('Iteration over `CellRowAndColumn`s', () => {
        const cells = new Array<CellRowAndColumn>();
        GridMatrix.forEachCellPosition(cellPosition => {
            cells.push(cellPosition);
        });

        expect(cells).toEqual([
            Cell.at(0, 0), Cell.at(0, 1), Cell.at(0, 2), Cell.at(0, 3), Cell.at(0, 4), Cell.at(0, 5), Cell.at(0, 6), Cell.at(0, 7), Cell.at(0, 8),
            Cell.at(1, 0), Cell.at(1, 1), Cell.at(1, 2), Cell.at(1, 3), Cell.at(1, 4), Cell.at(1, 5), Cell.at(1, 6), Cell.at(1, 7), Cell.at(1, 8),
            Cell.at(2, 0), Cell.at(2, 1), Cell.at(2, 2), Cell.at(2, 3), Cell.at(2, 4), Cell.at(2, 5), Cell.at(2, 6), Cell.at(2, 7), Cell.at(2, 8),
            Cell.at(3, 0), Cell.at(3, 1), Cell.at(3, 2), Cell.at(3, 3), Cell.at(3, 4), Cell.at(3, 5), Cell.at(3, 6), Cell.at(3, 7), Cell.at(3, 8),
            Cell.at(4, 0), Cell.at(4, 1), Cell.at(4, 2), Cell.at(4, 3), Cell.at(4, 4), Cell.at(4, 5), Cell.at(4, 6), Cell.at(4, 7), Cell.at(4, 8),
            Cell.at(5, 0), Cell.at(5, 1), Cell.at(5, 2), Cell.at(5, 3), Cell.at(5, 4), Cell.at(5, 5), Cell.at(5, 6), Cell.at(5, 7), Cell.at(5, 8),
            Cell.at(6, 0), Cell.at(6, 1), Cell.at(6, 2), Cell.at(6, 3), Cell.at(6, 4), Cell.at(6, 5), Cell.at(6, 6), Cell.at(6, 7), Cell.at(6, 8),
            Cell.at(7, 0), Cell.at(7, 1), Cell.at(7, 2), Cell.at(7, 3), Cell.at(7, 4), Cell.at(7, 5), Cell.at(7, 6), Cell.at(7, 7), Cell.at(7, 8),
            Cell.at(8, 0), Cell.at(8, 1), Cell.at(8, 2), Cell.at(8, 3), Cell.at(8, 4), Cell.at(8, 5), Cell.at(8, 6), Cell.at(8, 7), Cell.at(8, 8)
        ]);
    });

    test('Creation of `GridMatrix`', () => {
        const matrix = GridMatrix.newMatrix();

        expect(matrix.length).toBe(GridMatrix.SIDE_CELL_COUNT);
        for (const row of matrix) {
            expect(row.length).toBe(GridMatrix.SIDE_CELL_COUNT);
            for (const el of row) {
                expect(el).toBeUndefined();
            }
        }
    });
});
