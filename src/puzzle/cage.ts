import { joinArray, joinSet } from '../util/readableMessages';
import { Cell } from './cell';
import { CellsKeys } from './cellsKeys';
import { Grid } from './grid';
import { House } from './house';

export class Cage {
    readonly sum: number;
    readonly cells: Array<Cell>;
    readonly key: string;

    private constructor(sum: number, cells: Array<Cell>) {
        this.sum = Cage.validateSum(sum);
        this.cells = [...Cage.validateCells(cells)];
        this.cells.sort();
        this.key = `${this.sum} [${joinArray(this.cells)}]`;
    }

    private static validateSum(sum: number) {
        if (sum < 1 || sum > Grid.TOTAL_SUM) {
            Cage.throwValidationError(`Sum outside of range. Expected to be within [1, ${Grid.TOTAL_SUM}]. Actual: ${sum}`);
        }
        return sum;
    }

    private static validateCells(cells: Array<Cell>) {
        const { unique, duplicates } = new CellsKeys(cells);
        if (duplicates.size > 0) {
            Cage.throwValidationError(`${duplicates.size} duplicate cell(s): ${joinSet(duplicates)}`);
        }
        if (unique.size > House.SIZE) {
            Cage.throwValidationError(`Cell count should be <= ${House.SIZE}. Actual cell count: ${unique.size}`);
        }
        return cells;
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
