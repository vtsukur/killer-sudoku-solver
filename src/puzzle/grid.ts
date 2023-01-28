import { rowFrom1D, colFrom1D } from '../util/dimensionalMatrixMath';
import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku puzzle grid
 * which holds useful constants that describe mathematical properties of any puzzle grid
 * as well as utility methods that simplify iteration over grid's cells
 * and creation of matrices with grid's size.
 *
 * @public
 */
export class Grid {

    /**
     * Amount of {@link Cell}s on Grid's side.
     */
    static readonly SIDE_CELL_COUNT = 9;

    /**
     * Total amount of {@link Cell}s on the Grid.
     */
    static readonly CELL_COUNT = this.SIDE_CELL_COUNT * this.SIDE_CELL_COUNT;

    /**
     * Total sum of all numbers on the Grid.
     */
    static readonly SUM = this.SIDE_CELL_COUNT * House.SUM;

    private constructor() {
        // Non-contructible.
    }

    /**
     * Produces new iterator over Grid's {@link Cell}s
     * which consequently iterates from 'top left' `Cell` of the Grid to the 'right bottom' one.
     *
     * Rows are iterated consequently from first to last.
     * Each row is iterated starting with its first column consequently to the last one.
     * Row is iterated fully before proceeding to the next one, as follows:
     * ```
     * // (row, column)
     * (0, 0) -> (0, 1) -> (0, 2) -> ...  -> (0, 7) -> (0, 8) -> (1, 0) -> (1, 1) -> ... -> (8, 8)
     * ```
     *
     * @returns new iterator over Grid's {@link Cell}s.
     */
    static cellsIterator(): CellsIterator {
        return new CellsIterator((index: number) => {
            return Cell.at(
                colFrom1D(index, Grid.SIDE_CELL_COUNT),
                rowFrom1D(index, Grid.SIDE_CELL_COUNT),
            );
        }, Grid.CELL_COUNT);
    }

    static newMatrix() {
        return new Array(this.SIDE_CELL_COUNT).fill(undefined).map(() => new Array(this.SIDE_CELL_COUNT));
    }
}
