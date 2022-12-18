import { valuesForMsg } from '../util/readableMessages';
import { cellSetAndDuplicatesOf } from '../util/uniqueCells';
import { Cell } from './cell';
import { House } from './house';

export class Cage {
    #sum;
    #cells;
    #key;

    static #isInternalConstruction = false;

    constructor(sum, cells) {
        if (!Cage.#isInternalConstruction) {
            throw 'Cage is not directly constructable. Use static builder Cage.ofSum instead';
        }
        this.#sum = Cage.#validateSum(sum);
        this.#cells = [...Cage.#validateCells(cells)];
        this.#cells.sort();
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

        at(row, col) {
            this.cells.push(Cell.at(row, col));
            return this;
        }

        cell(aCell) {
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
            Cage.#isInternalConstruction = true;
            try {
                return new Cage(this.sum, this.cells);
            } finally {
                Cage.#isInternalConstruction = false;
            }
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
