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
        if (!Cell.#coordWithinRange(row)) {
            Cell.#throwOutOfRangeValidationError('Row', row);
        }
        if (!Cell.#coordWithinRange(col)) {
            Cell.#throwOutOfRangeValidationError('Column', col);
        }
    }

    static #coordWithinRange(i) {
        return i >= 0 && i < House.SIZE;
    }

    static #throwOutOfRangeValidationError(type, actualValue) {
        throw `Invalid cell. ${type} outside of range. Expected to be within [0, ${House.SIZE}). Actual: ${actualValue}`;
    }

    key() {
        return `(${this.row}, ${this.col})`;
    }

    toString() {
        return this.key();
    }
}
