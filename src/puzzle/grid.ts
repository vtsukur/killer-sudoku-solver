import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { CellRowAndColumn, CellRowAndColumnCallback, GridCellPositions } from './gridCellPositions';
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
     * Amount of {@link Cell}s on `Grid`'s side.
     */
    static readonly SIDE_CELL_COUNT = GridCellPositions.GRID_SIDE_CELL_COUNT;

    /**
     * Total amount of {@link Cell}s in a `Grid`.
     */
    static readonly CELL_COUNT = this.SIDE_CELL_COUNT * this.SIDE_CELL_COUNT;

    /**
     * Total sum of all numbers in a `Grid`.
     */
    static readonly SUM = this.SIDE_CELL_COUNT * House.SUM;

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    private static readonly _CELLS_ITERATOR_CACHE: ReadonlyArray<CellRowAndColumn> = this.buildIterationCache();

    private static buildIterationCache() {
        const val: Array<CellRowAndColumn> = [];
        Grid.forEachCellPosition(cellPosition => {
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
     * (0, 0) -> (0, 1) -> (0, 2) -> ...  -> (0, 7) -> (0, 8) -> (1, 0) -> (1, 1) -> ... -> (8, 8) -> done
     * ```
     *
     * @returns new iterator over `Grid`'s {@link Cell}s.
     */
    static newCellsIterator(): CellsIterator {
        return new CellsIterator((index: number) => {
            return Cell.atPosition(this._CELLS_ITERATOR_CACHE[index]);
        }, Grid.CELL_COUNT);
    }

    /**
     * Iterates over all `Cell`s in the `Grid` consequently calling `callback` with each {@link CellRowAndColumn}.
     *
     * Iteration sequence is the same way as in `newCellsIterator` method.
     *
     * @param callback - Function to be called with {@link CellRowAndColumn} for `Cell`s in the `Grid`.
     */
    static forEachCellPosition(callback: CellRowAndColumnCallback) {
        GridCellPositions.forEachCellPositionOnTheGrid(callback);
    }

    /**
     * Constructs new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
     *
     * @returns new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
     */
    static newMatrix() {
        return GridCellPositions.newGridSizedMatrix();
    }
}
