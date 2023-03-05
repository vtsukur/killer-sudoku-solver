import { GridSizeAndCellPositionsIteration } from '../../../src/puzzle/gridSizeAndCellPositionsIteration';
import { GridMatrix } from '../../../src/puzzle/gridMatrix';

describe('Unit tests for `GridMatrix`', () => {
    test('Creation of `GridMatrix`', () => {
        const matrix = GridMatrix.new();

        expect(matrix.length).toBe(GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT);
        for (const row of matrix) {
            expect(row.length).toBe(GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT);
            for (const el of row) {
                expect(el).toBeUndefined();
            }
        }
    });
});
