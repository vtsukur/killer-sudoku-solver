import { Cell, ReadonlyCells } from './cell';
import { Grid } from './grid';

/**
 * Supportive class for Killer Sudoku `Column`
 * which holds utility method that simplifies iteration over `Column` {@link Cell}s.
 *
 * @public
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
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
    static readonly CELLS: ReadonlyArray<ReadonlyCells> = (() => {
        const val = Grid.newMatrix<Cell>();
        for (const rowOfCells of Cell.GRID) {
            for (const cell of rowOfCells) {
                val[cell.col][cell.row] = cell;
            }
        }
        return val;
    })();

}
