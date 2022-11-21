import { House } from './house';

export class Cell {
    #key;

    constructor(row, col) {
        this.row = Cell.#validateIndex('Row', row);
        this.col = Cell.#validateIndex('Column', col);
        this.nonet = Math.floor(row / House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH + Math.floor(col / House.NONET_SIDE_LENGTH);
        this.#key = Cell.keyOf(row, col);
    }

    static #validateIndex(type, actualValue) {
        if (!Cell.#coordWithinRange(actualValue)) {
            throw `Invalid cell. ${type} outside of range. Expected to be within [0, ${House.SIZE}). Actual: ${actualValue}`;
        } else {
            return actualValue;
        }
    }

    static #coordWithinRange(i) {
        return i >= 0 && i < House.SIZE;
    }

    static at(row, col) {
        return new Cell(row, col);
    }

    static keyOf(row, col) {
        return `(${row}, ${col})`
    }

    get key() {
        return this.#key;
    }

    toString() {
        return this.key;
    }
}
