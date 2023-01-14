import * as _ from 'lodash';
import { Grid } from './grid';
import { Nonet } from './nonet';

export class Cell {
    readonly row: number;
    readonly col: number;
    readonly key: string;
    readonly nonet: number;
    readonly singleDimensionalGridIndex: number;

    constructor(row: number, col: number) {
        this.row = Cell.validateRow(row);
        this.col = Cell.validateCol(col);
        this.key = Cell.keyOf(row, col);
        this.nonet = Nonet.indexOf(row, col);
        this.singleDimensionalGridIndex = row * Grid.SIDE_LENGTH + col;
    }

    private static validateRow(val: number) {
        return this.validate2DIndex('Row', val);
    }

    private static validateCol(val: number) {
        return this.validate2DIndex('Column', val);
    }

    private static validate2DIndex(type: string, val: number) {
        if (!_.inRange(val, 0, Grid.SIDE_LENGTH)) {
            throw `Invalid cell. ${type} outside of range. Expected to be within [0, ${Grid.SIDE_LENGTH}). Actual: ${val}`;
        } else {
            return val;
        }
    }

    static at(row: number, col: number) {
        return new Cell(row, col);
    }

    static keyOf(row: number, col: number) {
        return `(${row}, ${col})`;
    }

    toString() {
        return this.key;
    }
}

export class CellsKeys {
    readonly all: ReadonlySet<string>;
    readonly duplicates: ReadonlySet<string>;

    constructor(cells: Array<Cell>) {
        const all = new Set<string>();
        const duplicates = new Set<string>();
        for (const cell of cells) {
            if (all.has(cell.key)) {
                duplicates.add(cell.key);
            } else {
                all.add(cell.key);
            }
        }
        this.all = all;
        this.duplicates = duplicates;
    }
}
