import * as _ from 'lodash';
import { Grid } from './grid';
import { Nonet } from './nonet';

export type CellKey = string;

export class Cell {
    readonly row: number;
    readonly col: number;
    readonly key: CellKey;
    readonly nonet: number;

    private constructor(row: number, col: number) {
        this.row = Cell.validateRow(row);
        this.col = Cell.validateCol(col);
        this.key = Cell.keyOf(row, col);
        this.nonet = Nonet.forCellAt(row, col);
    }

    private static validateRow(val: number) {
        return Cell.validate2DIndex(val, 'Row');
    }

    private static validateCol(val: number) {
        return Cell.validate2DIndex(val, 'Column');
    }

    private static validate2DIndex(val: number, type: string) {
        if (!_.inRange(val, 0, Grid.SIDE_LENGTH)) {
            throw `Invalid cell. ${type} outside of range. Expected to be within [0, ${Grid.SIDE_LENGTH}). Actual: ${val}`;
        } else {
            return val;
        }
    }

    static keyOf(row: number, col: number): CellKey {
        return `(${row}, ${col})`;
    }

    static at(row: number, col: number) {
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
