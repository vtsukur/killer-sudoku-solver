import { GridCellPositions } from './gridCellPositions';

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
     */
    static new = () => {
        return new Array(GridCellPositions.GRID_SIDE_CELL_COUNT).fill(undefined).map(() => {
            return new Array(GridCellPositions.GRID_SIDE_CELL_COUNT);
        });
    };
}
