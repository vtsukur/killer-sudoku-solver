import { GridSizeAndCellPositionsIteration } from '../../../src/puzzle/gridSizeAndCellPositionsIteration';
import { GridSizedMatrix } from '../../../src/puzzle/gridSizedMatrix';

describe('Unit tests for `GridSizedMatrix`', () => {
    test('Creation of `GridSizedMatrix`', () => {
        const matrix = GridSizedMatrix.new();

        expect(matrix.length).toBe(GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT);
        for (const row of matrix) {
            expect(row.length).toBe(GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT);
            for (const el of row) {
                expect(el).toBeUndefined();
            }
        }
    });
});
