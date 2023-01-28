import * as _ from 'lodash';
import { Grid } from './grid';
import { HouseIndex } from './house';
import { Nonet } from './nonet';

export type CellKey = string;

export class Cell {
    readonly row: HouseIndex;
    readonly col: HouseIndex;
    readonly nonet: HouseIndex;
    readonly key: CellKey;

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

    static keyOf(row: HouseIndex, col: HouseIndex): CellKey {
        return `(${row}, ${col})`;
    }

    static at(row: HouseIndex, col: HouseIndex) {
        return new Cell(row, col);
    }

    toString() {
        return this.key;
    }
}

export type Cells = Array<Cell>;
export type ReadonlyCells = ReadonlyArray<Cell>;

export type CellKeysSet = Set<CellKey>;
export type ReadonlyCellKeysSet = ReadonlySet<CellKey>;
