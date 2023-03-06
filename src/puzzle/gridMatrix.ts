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
 * Supportive class for Killer Sudoku `Grid` matrix
 * which holds useful constants that describe mathematical properties of any `Grid`
 * as well as utility methods that simplify iteration over `Grid` {@link Cell}s' positions,
 * {@link CellRowAndColumn}s and creation of supplementary ranges and matrices of `Grid`'s size.
 */
export class GridMatrix {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Amount of `Cell`s on the `Grid`'s side.
     */
    static readonly SIDE_CELL_COUNT = 9;

    /**
     * Range as a readonly array of numbers from 0 to 8 to represent iteration over `Grid`'s side `Cell`s.
     */
    static readonly SIDE_INDICES_RANGE = CachedNumRanges.ZERO_TO_N_LTE_81[this.SIDE_CELL_COUNT];

    /**
     * Total amount of {@link Cell}s on the `Grid`.
     */
    static readonly CELL_COUNT = Math.imul(this.SIDE_CELL_COUNT, this.SIDE_CELL_COUNT);

    /**
     * Range as a readonly array of numbers from 0 to 80 to represent indices of all `Cell`s on the `Grid`.
     */
    static readonly CELL_INDICES_RANGE = CachedNumRanges.ZERO_TO_N_LTE_81[this.CELL_COUNT];

    private static readonly _CELL_POSITIONS_CACHE: ReadonlyArray<CellRowAndColumn> = (() => {
        const val = new Array<CellRowAndColumn>();
        for (const row of this.SIDE_INDICES_RANGE) {
            for (const col of this.SIDE_INDICES_RANGE) {
                val.push([ row, col ]);
            }
        }
        return val;
    })();

    /**
     * Iterates over all `Cell` positions on the `Grid`
     * consequently calling `callback` with each {@link CellRowAndColumn}.
     *
     * `Row`s are iterated consequently from first to last (a.k.a. _top_ to _bottom_).
     * Each `Row` is iterated starting with its first `Column`
     * consequently to the last one (a.k.a. _left_ to _right_).
     * `Row` is iterated fully before proceeding to the next one.
     *
     * Iteration looks as follows:
     * ```
     * // (row, column)
     * (0, 0) -> (0, 1) -> (0, 2) -> ... -> (0, 7) -> (0, 8) -> (1, 0) -> (1, 1) -> ... -> (8, 8) -> done
     * ```
     *
     * @param callback - Function to be called with {@link CellRowAndColumn} for `Cell`s on the `Grid`.
     */
    static forEachCellPosition(callback: CellRowAndColumnCallback) {
        for (const cellPosition of this._CELL_POSITIONS_CACHE) {
            callback(cellPosition);
        }
    };

    /**
     * Constructs new matrix (array of arrays) of `Grid`'s size indexed by `Row` and then by `Column`.
     *
     * @returns new matrix (array of arrays) of `Grid`'s size indexed by `Row` and then by `Column`.
     *
     * @typeParam T - Type of values in the matrix.
     */
    static newMatrix<T>(): Array<Array<T>> {
        const val = new Array<Array<T>>(this.SIDE_CELL_COUNT);
        this.SIDE_INDICES_RANGE.forEach((_empty, index) => {
            val[index] = new Array<T>(this.SIDE_CELL_COUNT);
        });
        return val;
    };

}