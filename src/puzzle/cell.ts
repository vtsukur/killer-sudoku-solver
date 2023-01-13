import * as _ from 'lodash';
import { House } from './house';
import { Nonet } from './nonet';

export class Cell {
    readonly row: number;
    readonly col: number;
    readonly key: string;
    readonly nonet: number;
    readonly absIndex: number;

    constructor(row: number, col: number) {
        this.row = Cell.validateIndex('Row', row);
        this.col = Cell.validateIndex('Column', col);
        this.key = Cell.keyOf(row, col);
        this.nonet = Nonet.indexOf(row, col);
        this.absIndex = row * House.SIZE + col;
    }

    private static validateIndex(type: string, index: number) {
        if (!Cell.indexWithinRange(index)) {
            throw `Invalid cell. ${type} outside of range. Expected to be within [0, ${House.SIZE}). Actual: ${index}`;
        } else {
            return index;
        }
    }

    private static indexWithinRange(index: number) {
        return _.inRange(index, 0, House.SIZE);
    }

    static at(row: number, col: number) {
        return new Cell(row, col);
    }

    static keyOf(row: number, col: number) {
        return `(${row}, ${col})`
    }

    toString() {
        return this.key;
    }

    static setAndDuplicateKeysOf = (cells: Cell[]) => {
        const set = new Set<string>();
        const duplicateKeys = new Array<string>();
        cells.forEach(cell => {
            if (set.has(cell.key)) {
                duplicateKeys.push(cell.key);
            } else {
                set.add(cell.key);
            }
        });
        return { set, duplicateKeys };
    }
}
