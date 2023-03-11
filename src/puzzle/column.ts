import { Cell, CellsMatrix } from './cell';
import { Grid } from './grid';

/**
 * Supportive class for Killer Sudoku `Column`
 * which holds utility method that simplifies iteration over `Column` {@link Cell}s.
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 *
 * @public
 */
export class Column {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * {@link Cell}s for each {@link Column}
     * represented as a readonly array of {@link ReadonlyCells} indexed by {@link Column}.
     */
    static readonly CELLS: CellsMatrix = (() => {
        const val = Grid.newMatrix<Cell>();
        for (const cell of Cell.ALL) {
            val[cell.col][cell.row] = cell;
        }
        return val;
    })();

}
