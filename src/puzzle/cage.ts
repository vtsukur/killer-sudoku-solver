import * as _ from 'lodash';
import { joinArray, joinSet } from '../util/readableMessages';
import { Cell } from './cell';
import { CellsKeys } from './cellsKeys';
import { Grid } from './grid';

export class Cage {
    readonly sum: number;
    readonly cells: Array<Cell>;
    readonly key: string;

    private static MAX_SUM_EXCLUSIVE = Grid.TOTAL_SUM + 1;

    private constructor(sum: number, cells: Array<Cell>) {
        this.sum = Cage.validateSum(sum);
        this.cells = [...Cage.validateCells(cells)];
        this.cells.sort();
        this.key = `${this.sum} [${joinArray(this.cells)}]`;
    }

    private static validateSum(val: number) {
        if (!_.inRange(val, 1, Cage.MAX_SUM_EXCLUSIVE)) {
            Cage.throwValidationError(`Sum outside of range. Expected to be within [1, ${Cage.MAX_SUM_EXCLUSIVE}). Actual: ${val}`);
        }
        return val;
    }

    private static validateCells(val: Array<Cell>) {
        const { hasDuplicates, duplicates } = new CellsKeys(val);
        if (hasDuplicates) {
            Cage.throwValidationError(`Found ${duplicates.size} duplicate cell(s): ${joinSet(duplicates)}`);
        }
        return val;
    }

    private static throwValidationError(detailedMessage: string) {
        throw `Invalid cage. ${detailedMessage}`;
    }

    static ofSum(sum: number) {
        return new this.Builder(sum);
    }
    
    private static Builder = class {
        private sum: number;
        private cells: Array<Cell>;

        constructor(sum: number) {
            this.sum = sum;
            this.cells = [];
        }

        at(row: number, col: number) {
            this.cells.push(Cell.at(row, col));
            return this;
        }

        cell(aCell: Cell) {
            if (!aCell || !(aCell instanceof Cell)) {
                throw `Invalid cell value. Expected to be instance of Cage. Actual: ${aCell}`;
            }
            this.cells.push(aCell);
            return this;
        }

        get cellCount() {
            return this.cells.length;
        }

        mk() {
            return new Cage(this.sum, this.cells);
        }
    };
    
    get cellCount() {
        return this.cells.length;
    }

    toString() {
        return this.key;
    }
}
