import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { CellRowAndColumn, GridMatrix } from './gridMatrix';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku `Grid`
 * which holds useful constants that describe mathematical properties of any `Grid`
 * as well as utility methods that simplify iteration over `Grid` {@link Cell}s,
 * {@link CellRowAndColumn}s and creation of supplementary ranges and matrices with `Grid`'s size.
 *
 * @public
 */
export class Grid {

    /**
     * Total sum of all numbers in a `Grid`.
     */
    static readonly SUM = Math.imul(GridMatrix.SIDE_CELL_COUNT, House.SUM);

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    private static readonly _CELLS_ITERATOR_CACHE: ReadonlyArray<CellRowAndColumn> = this.buildIterationCache();

    private static buildIterationCache() {
        const val: Array<CellRowAndColumn> = [];
        GridMatrix.forEachCellPosition(cellPosition => {
            val.push(cellPosition);
        });
        return val;
    }

    /**
     * Constructs new iterator over `Grid`'s {@link Cell}s
     * which iterates consequently from _top left_ `Cell` of the `Grid` to the _right bottom_ one.
     *
     * Rows are iterated consequently from first to last (a.k.a. _top_ to _bottom_).
     * Each row is iterated starting with its first column consequently to the last one (a.k.a. _left_ to _right_).
     * Row is iterated fully before proceeding to the next one.
     *
     * Iteration looks as follows:
     * ```
     * // (row, column)
     * (0, 0) -> (0, 1) -> (0, 2) -> ... -> (0, 7) -> (0, 8) -> (1, 0) -> (1, 1) -> ... -> (8, 8) -> done
     * ```
     *
     * @returns new iterator over `Grid`'s {@link Cell}s.
     */
    static newCellsIterator(): CellsIterator {
        return new CellsIterator((index: number) => {
            return Cell.atPosition(this._CELLS_ITERATOR_CACHE[index]);
        }, GridMatrix.CELL_COUNT);
    }

}
