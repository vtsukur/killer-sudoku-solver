import { Column } from './column';
import { CellRowAndColumn, GridSizeAndCellPositionsIteration } from './gridSizeAndCellPositionsIteration';
import { GridSizedMatrix } from './gridSizedMatrix';
import { HouseIndex } from './house';
import { Nonet } from './nonet';
import { Row } from './row';

/**
 * Human-readable key describing square's unique position on the `Grid`.
 */
export type CellKey = string;

/**
 * Mutable `Set` of human-readable `Cell` keys: {@link Cell#key}.
 */
export type CellKeysSet = Set<CellKey>;

/**
 * Readonly `Set` of human-readable `Cell` keys: {@link Cell#key}.
 */
export type ReadonlyCellKeysSet = ReadonlySet<CellKey>;

/**
 * Single square on the Killer Sudoku `Grid`.
 *
 * `Cell` API provides access to indices of a `Row` ({@link Cell#row}),
 * `Column` ({@link Cell#col}) and `Nonet` ({@link Cell#nonet}) that a `Cell` is positioned at.
 *
 * It also provides {@link Cell#key} which can be used both
 * as a unique `Cell` id within a `Grid` as well as human-readable representation of `Cell` position.
 *
 * As this type is used to model input problem only (as opposed to modeling solution), it does NOT hold the number in the square.
 *
 * @public
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 */
export class Cell {

    /**
     * Index of a `Row` that this `Cell` is positioned at.
     */
    readonly row: HouseIndex;

    /**
     * Index of a `Column` that this `Cell` is positioned at.
     */
    readonly col: HouseIndex;

    /**
     * Index of a `Cell` within the `Grid` in the range of [0, 81).
     *
     * `Cell`s are indexed consequently from _top left_ position of the `Grid` to the _right bottom_ one.
     *
     * `Cell`s in the rows are indexed consequently from first to last (a.k.a. _top_ to _bottom_).
     * `Cell`s in each row are indexed starting with its first column consequently to the last one (a.k.a. _left_ to _right_).
     * `Cell`s in the row are indexed fully before proceeding to the next one.
     *
     * For the `Cells` at positions:
     * ```
     * // (row, column)
     * (0, 0) -> (0, 1) -> (0, 2) -> ... -> (0, 7) -> (0, 8) -> (1, 0) -> (1, 1) -> ... (4, 5) -> ... -> (8, 8)
     * ```
     *
     * respective indices are:
     * ```
     *      0 ->      1 ->      2 -> ... ->      7 ->      8 ->      9 ->     10 -> ...     41 -> ... ->     80
     * ```
     */
    readonly index: number;

    /**
     * Human-readable key describing square's unique position on the `Grid`.
     */
    readonly key: CellKey;

    private static readonly _CACHED_INSTANCES: Array<Array<Cell>> = GridSizedMatrix.new();

    static {
        GridSizeAndCellPositionsIteration.forEachCellPositionOnTheGrid(([ row, col ]) => {
            this._CACHED_INSTANCES[row][col] = new Cell(row, col);
        });
    }

    /**
     * Produces `Cell` with the given indices of a `Row` and `Column` the `Cell` is positioned at.
     *
     * @param row - Index of a `Row` that this `Cell` is positioned at.
     * @param col - Index of a `Column` that this `Cell` is positioned at.
     *
     * @returns `Cell` with the given indices of a `Row` and `Column` the `Cell` is positioned at.
     *
     * @throws {InvalidProblemDefError} if `Cell` position is outside of the `Grid`.
     */
    static at(row: HouseIndex, col: HouseIndex) {
        Row.validateIndex(row);
        Column.validateIndex(col);
        return this._CACHED_INSTANCES[row][col];
    }

    /**
     * Produces `Cell` with the given indices of a `Row` and `Column` the `Cell` is positioned at.
     *
     * @param val - Tuple of `Cell` `Row` and `Column` indices which identify `Cell` position on the `Grid`.
     *
     * @returns `Cell` with the given indices of a `Row` and `Column` the `Cell` is positioned at.
     *
     * @throws {InvalidProblemDefError} if `Cell` position is outside of the `Grid`.
     */
    static atPosition(val: CellRowAndColumn) {
        return Cell.at(val[0], val[1]);
    }

    private constructor(row: HouseIndex, col: HouseIndex) {
        this.row = row;
        this.col = col;
        this.index = Math.imul(row, GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT) + col;
        this.key = Cell.keyOf(row, col);
    }

    /**
     * Index of a `Nonet` that this `Cell` is positioned at.
     *
     * `Nonet` index is computed from `Row` and `Column` indices.
     */
    get nonet() {
        return Nonet.indexForCellAt(this.row, this.col);
    }

    private static keyOf(row: HouseIndex, col: HouseIndex): CellKey {
        return `(${row}, ${col})`;
    }

    /**
     * Returns human-readable string representation of the `Cell` which is the same as {@link Cell#key}.
     *
     * @returns human-readable string representation of the `Cell` which is the same as {@link Cell#key}.
     */
    toString() {
        return this.key;
    }

}

/**
 * Mutable array of `Cell`s.
 */
export type Cells = Array<Cell>;

/**
 * Readonly array of `Cell`s.
 */
export type ReadonlyCells = ReadonlyArray<Cell>;
