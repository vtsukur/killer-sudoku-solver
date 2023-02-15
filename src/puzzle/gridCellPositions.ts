import { CachedNumRanges } from '../solver/math/cachedNumRanges';
import { HouseIndex } from './house';

/**
 * Tuple of `Cell` `Row` and `Column` indices which identify `Cell` position on the `Grid`.
 */
export type CellRowAndColumn = [ HouseIndex, HouseIndex ];

/**
 * Function to be called with {@link CellRowAndColumn} for `Cell`s in the `Grid`.
 */
export type CellRowAndColumnCallback = (cellPosition: CellRowAndColumn) => void;

/**
 * Supportive class to define reusable logic for positioning of `Cell` on the `Grid`
 * to be reused by core Sudoku Puzzle types.
 */
export class GridCellPositions {

    /**
     * Amount of `Cell`s on `Grid`'s side.
     */
    static readonly GRID_SIDE_CELL_COUNT = 9;

    /**
     * Constructs new range as an array of numbers from 0 to 8 to represent iteration over `Grid`'s side `Cell`s.
     *
     * @returns new range as an array of numbers from 0 to 8 to represent iteration over `Grid`'s side `Cell`s.
     */
    static readonly GRID_SIDE_INDICES_RANGE = CachedNumRanges.ZERO_TO_N_LT_81[this.GRID_SIDE_CELL_COUNT];

    /**
     * Iterates over all `Cell`s in the `Grid` consequently calling `callback` with each {@link CellRowAndColumn}.
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
     * @param callback - Function to be called with {@link CellRowAndColumn} for `Cell`s in the `Grid`.
     */
    static forEachCellPositionOnTheGrid = (callback: CellRowAndColumnCallback) => {
        for (const row of this.GRID_SIDE_INDICES_RANGE) {
            for (const col of this.GRID_SIDE_INDICES_RANGE) {
                callback([ row, col ]);
            }
        }
    };

    /**
     * Constructs new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
     *
     * @returns new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
     */
    static newGridMatrix = () => {
        return new Array(this.GRID_SIDE_CELL_COUNT).fill(undefined).map(() => {
            return new Array(this.GRID_SIDE_CELL_COUNT);
        });
    };
}
