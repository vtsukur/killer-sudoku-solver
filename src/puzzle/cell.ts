import * as _ from 'lodash';
import { Grid } from './grid';
import { HouseIndex } from './house';
import { Nonet } from './nonet';

export type CellKey = string;

/**
 * Single square on the Killer Sudoku `Grid`.
 *
 * `Cell` API opens access to indices of a `Row` ({@link Cell#row}),
 * `Column` ({@link Cell#col}) and `Nonet` ({@link Cell#nonet}) that a `Cell` resides on.
 *
 * It also provides {@link Cell#key} which can be used both
 * as a unique `Cell` id within a `Grid` as well as human-readable representation of `Cell` position.
 *
 * As this type is used to model input problem only (as opposed to modeling solution), it does NOT hold the number of the square.
 *
 * @public
 */
export class Cell {

    /**
     * Index of a `Row` that this `Cell` resides on.
     */
    readonly row: HouseIndex;

    /**
     * Index of a `Column` that this `Cell` resides on.
     */
    readonly col: HouseIndex;

    /**
     * Index of a `Nonet` that this `Cell` resides on.
     */
    readonly nonet: HouseIndex;

    /**
     * Human-readable key describing square's unique position on the `Grid`.
     */
    readonly key: CellKey;

    /**
     * Constructs new `Cell` with the given indices of a `Row` and `Column` the `Cell` resides on.
     *
     * @param row - Index of a `Row` that this `Cell` resides on.
     * @param col - Index of a `Column` that this `Cell` resides on.
     *
     * @returns new `Cell` with the given indices of a `Row` and `Column` the `Cell` resides on.
     */
    static at(row: HouseIndex, col: HouseIndex) {
        return new Cell(row, col);
    }

    private constructor(row: HouseIndex, col: HouseIndex) {
        this.row = Cell.validateRow(row);
        this.col = Cell.validateCol(col);
        this.nonet = Nonet.indexForCellAt(row, col);
        this.key = Cell.keyOf(row, col);
    }

    private static validateRow(val: HouseIndex) {
        return Cell.validate2DIndex(val, 'Row');
    }

    private static validateCol(val: HouseIndex) {
        return Cell.validate2DIndex(val, 'Column');
    }

    private static validate2DIndex(val: HouseIndex, type: string) {
        if (!_.inRange(val, 0, Grid.SIDE_CELL_COUNT)) {
            throw `Invalid cell. ${type} outside of range. Expected to be within [0, ${Grid.SIDE_CELL_COUNT}). Actual: ${val}`;
        } else {
            return val;
        }
    }

    /**
     * Generates human-readable key describing square's unique position on the `Grid`
     * by the given indices of a `Row` and `Column` the `Cell` resides on.
     *
     * @param row - Index of a `Row` that this `Cell` resides on.
     * @param col - Index of a `Column` that this `Cell` resides on.
     *
     * @returns Human-readable key describing square's unique position on the `Grid`.
     */
    static keyOf(row: HouseIndex, col: HouseIndex): CellKey {
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

export type Cells = Array<Cell>;
export type ReadonlyCells = ReadonlyArray<Cell>;

export type CellKeysSet = Set<CellKey>;
export type ReadonlyCellKeysSet = ReadonlySet<CellKey>;
