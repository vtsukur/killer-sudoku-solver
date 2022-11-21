import { Cell } from './cell';
import { House } from './house';
import { cellSetAndDuplicatesOf } from './uniqueCells';

export class Cage {
    #cellSet;

    constructor(sum, cells) {
        this.sum = Cage.#validateSum(sum);
        this.#cellSet = Cage.#validateCellsAndTransformToSet(cells);
        this.cells = [...cells];
    }

    static #validateSum(sum) {
        if (sum < 1 || sum > House.SUM) {
            Cage.#throwValidationError(`Sum outside of range. Expected to be within [1, ${House.SUM}]. Actual: ${sum}`);
        }
        return sum;
    }

    static #validateCellsAndTransformToSet(cells) {
        const { cellSet, duplicateCellKeys } = cellSetAndDuplicatesOf(cells);
        if (duplicateCellKeys.length > 0) {
            Cage.#throwValidationError(`${duplicateCellKeys.length} duplicate cell(s): ${duplicateCellKeys.join(', ')}`);
        }
        if (cellSet.size > House.SIZE) {
            Cage.#throwValidationError(`Cell count should be <= ${House.SIZE}. Actual cell count: ${cellSet.size}`);
        }
        return cellSet;
    }

    static #throwValidationError(detailedMessage) {
        throw `Invalid cage. ${detailedMessage}`;
    }

    get cellCount() {
        return this.cells.length;
    }

    has(cell) {
        return this.#cellSet.has(cell.key);
    }

    get key() {
        return `${this.sum} [${this.cells.join(', ')}]`;
    }

    toString() {
        return this.key;
    }

    static Builder = class {
        constructor(sum) {
            this.sum = sum;
            this.cells = [];
        }

        at(row, cellIdx) {
            this.cells.push(Cell.at(row, cellIdx));
            return this;
        }

        mk() {
            return new Cage(this.sum, this.cells);
        }
    }

    static ofSum(sum) {
        return new this.Builder(sum);
    }
}
