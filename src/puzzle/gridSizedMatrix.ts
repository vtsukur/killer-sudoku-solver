import { GridSizeAndCellPositionsIteration } from './gridSizeAndCellPositionsIteration';

/**
 * Provides API to constructs new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
 */
export class GridSizedMatrix {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Constructs new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
     *
     * @returns new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
     *
     * @typeParam T - Type of values in the matrix.
     */
    static new<T>(): Array<Array<T>> {
        const val = new Array<Array<T>>(GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT);
        GridSizeAndCellPositionsIteration.GRID_SIDE_INDICES_RANGE.forEach((_empty, index) => {
            val[index] = new Array<T>(GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT);
        });
        return val;
    };
}
