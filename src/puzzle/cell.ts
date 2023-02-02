import { MutableSet } from '../util/mutableSet';
import { Column } from './column';
import { Grid } from './grid';
import { HouseIndex } from './house';
import { Nonet } from './nonet';
import { Row } from './row';

/**
 * Tuple of `Cell` `Row` and `Column` indices which identify `Cell` position on the `Grid`.
 */
export type CellPosition = [ HouseIndex, HouseIndex ];

/**
 * Human-readable key describing square's unique position on the `Grid`.
 */
export type CellKey = string;

/**
 * Mutable `Set` of human-readable `Cell` keys: {@link Cell#key}.
 */
export type CellKeysSet = MutableSet<CellKey>;

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
     * Human-readable key describing square's unique position on the `Grid`.
     */
    readonly key: CellKey;

    private static readonly _CACHED_INSTANCES: Array<Array<Cell>> = Grid.newMatrix();

    static {
        Grid.forEachCellPosition(([ row, col ]) => {
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
    static atPosition(val: CellPosition) {
        return Cell.at(val[0], val[1]);
    }

    private constructor(row: HouseIndex, col: HouseIndex) {
        this.row = row;
        this.col = col;
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
