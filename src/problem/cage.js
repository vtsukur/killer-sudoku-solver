import { Cell } from './cell';
import { cellSetAndDuplicatesOf } from './uniqueCells';

export class Cage {
    #cellSet;

    constructor(sum, cells) {
        this.sum = sum;
        this.#cellSet = Cage.#validateCellsAndTransformToSet(cells);
        this.cells = [...cells];
    }

    static #validateCellsAndTransformToSet(cells) {
        const { cellSet, duplicateCellKeys } = cellSetAndDuplicatesOf(cells);
        if (duplicateCellKeys.length > 0) {
            Cage.#throwValidationError(`${duplicateCellKeys.length} duplicate cell(s): ${duplicateCellKeys.join(', ')}`);
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
