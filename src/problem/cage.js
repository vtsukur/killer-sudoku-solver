import { valuesForMsg } from '../util/readableMessages';
import { cellSetAndDuplicatesOf } from '../util/uniqueCells';
import { Cell } from './cell';
import { House } from './house';

export class Cage {
    #sum;
    #cells;
    #key;

    constructor(sum, cells) {
        this.#sum = Cage.#validateSum(sum);
        this.#cells = [...Cage.#validateCells(cells)];
        this.#key = `${this.sum} [${valuesForMsg(this.cells)}]`;
    }

    static #validateSum(sum) {
        if (sum < 1 || sum > House.SUM) {
            Cage.#throwValidationError(`Sum outside of range. Expected to be within [1, ${House.SUM}]. Actual: ${sum}`);
        }
        return sum;
    }

    static #validateCells(cells) {
        const { cellSet, duplicateCellKeys } = cellSetAndDuplicatesOf(cells);
        if (duplicateCellKeys.length > 0) {
            Cage.#throwValidationError(`${duplicateCellKeys.length} duplicate cell(s): ${valuesForMsg(duplicateCellKeys)}`);
        }
        if (cellSet.size > House.SIZE) {
            Cage.#throwValidationError(`Cell count should be <= ${House.SIZE}. Actual cell count: ${cellSet.size}`);
        }
        return cells;
    }

    static #throwValidationError(detailedMessage) {
        throw `Invalid cage. ${detailedMessage}`;
    }

    static ofSum(sum) {
        return new this.#Builder(sum);
    }
    
    static #Builder = class {
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
    
    get sum() {
        return this.#sum;
    }

    get cells() {
        return this.#cells;
    }

    get cellCount() {
        return this.#cells.length;
    }

    get key() {
        return this.#key;
    }

    toString() {
        return this.#key;
    }
}
