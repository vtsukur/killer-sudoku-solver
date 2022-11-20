import { House } from './house';

export class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.nonet = Math.floor(row / House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH + Math.floor(col / House.NONET_SIDE_LENGTH);
    }

    isWithinRange() {
        return this.#coordWithinRange(this.row) && this.#coordWithinRange(this.col);
    }

    #coordWithinRange(i) {
        return i >= 0 && i < House.SIZE;
    }

    key() {
        return `(${this.row}, ${this.col})`;
    }

    toString() {
        return this.key();
    }

    static at(row, col) {
        return new Cell(row, col);
    }
}
