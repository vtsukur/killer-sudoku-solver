import _ from 'lodash';
import { House } from './house';
import { Nonet } from './nonet';

export class Cell {
    #row;
    #col;
    #key;

    constructor(row, col) {
        this.#row = Cell.#validateIndex('Row', row);
        this.#col = Cell.#validateIndex('Column', col);
        this.#key = Cell.keyOf(row, col);
        this.nonet = Nonet.indexOf(row, col);
    }

    static #validateIndex(type, actualValue) {
        if (!Cell.#coordWithinRange(actualValue)) {
            throw `Invalid cell. ${type} outside of range. Expected to be within [0, ${House.SIZE}). Actual: ${actualValue}`;
        } else {
            return actualValue;
        }
    }

    static #coordWithinRange(i) {
        return _.inRange(i, 0, House.SIZE);
    }

    static at(row, col) {
        return new Cell(row, col);
    }

    static keyOf(row, col) {
        return `(${row}, ${col})`
    }

    get row() {
        return this.#row;
    }

    get col() {
        return this.#col;
    }

    get key() {
        return this.#key;
    }

    get absIdx() {
        return this.#row * House.SIZE + this.#col;
    }

    toString() {
        return this.#key;
    }

    static cellSetAndDuplicatesOf = (cells) => {
        const cellSet = new Set();
        const duplicateCellKeys = [];
        cells.forEach(cell => {
            if (cellSet.has(cell.key)) {
                duplicateCellKeys.push(cell.key);
            } else {
                cellSet.add(cell.key);
            }
        });
        return { cellSet, duplicateCellKeys };
    }
}
