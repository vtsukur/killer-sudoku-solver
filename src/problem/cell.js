import { House } from './house';

export class Cell {
    constructor(row, col) {
        Cell.#validate(row, col);
        this.row = row;
        this.col = col;
        this.nonet = Math.floor(row / House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH + Math.floor(col / House.NONET_SIDE_LENGTH);
    }

    static at(row, col) {
        return new Cell(row, col);
    }

    static #validate(row, col) {
        Cell.#validateIndex('Row', row);
        Cell.#validateIndex('Column', col);
    }

    static #validateIndex(type, actualValue) {
        if (!Cell.#coordWithinRange(actualValue)) {
            throw `Invalid cell. ${type} outside of range. Expected to be within [0, ${House.SIZE}). Actual: ${actualValue}`;
        }
    }

    static #coordWithinRange(i) {
        return i >= 0 && i < House.SIZE;
    }

    key() {
        return `(${this.row}, ${this.col})`;
    }

    toString() {
        return this.key();
    }
}
