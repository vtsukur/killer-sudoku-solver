import * as _ from 'lodash';
import { joinArray } from '../util/readableMessages';
import { Cell } from './cell';
import { Grid } from './grid';

export class Cage {
    readonly sum: number;
    readonly cells: Array<Cell>;
    readonly key: string;

    private static MAX_SUM_EXCLUSIVE = Grid.TOTAL_SUM + 1;

    private constructor(sum: number, cells: Array<Cell>) {
        this.sum = sum;
        this.cells = [...cells];
        this.cells.sort();
        this.key = `${this.sum} [${joinArray(this.cells)}]`;
    }

    static ofSum(sum: number) {
        Cage.validateSum(sum);
        return new this.Builder(sum);
    }
    
    private static Builder = class {
        private sum: number;
        private cells: Array<Cell> = [];
        private cellKeys: Set<string> = new Set();

        constructor(sum: number) {
            this.sum = sum;
        }

        at(row: number, col: number) {
            return this.cell(Cell.at(row, col));
        }

        cell(val: Cell) {
            if (!val) {
                throw `Invalid cell value: ${val}`;
            }
            if (this.cellKeys.has(val.key)) {
                Cage.throwValidationError(`Found duplicate cell: ${val.key}`);
            }
            this.cells.push(val);
            this.cellKeys.add(val.key);
            return this;
        }

        get cellCount() {
            return this.cells.length;
        }

        mk() {
            return new Cage(this.sum, this.cells);
        }
    };
    
    private static validateSum(val: number) {
        if (!_.inRange(val, 1, Cage.MAX_SUM_EXCLUSIVE)) {
            Cage.throwValidationError(`Sum outside of range. Expected to be within [1, ${Cage.MAX_SUM_EXCLUSIVE}). Actual: ${val}`);
        }
        return val;
    }

    private static throwValidationError(detailedMessage: string) {
        throw `Invalid cage. ${detailedMessage}`;
    }

    get cellCount() {
        return this.cells.length;
    }

    toString() {
        return this.key;
    }
}
