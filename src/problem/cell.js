import { House } from './house';

export class Cell {
    constructor(rowIdx, colIdx) {
        this.rowIdx = rowIdx;
        this.colIdx = colIdx;
        this.nonetIdx = Math.floor(rowIdx / House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH + Math.floor(colIdx / House.NONET_SIDE_LENGTH);
    }

    isWithinRange() {
        return this.#coordWithinRange(this.rowIdx) && this.#coordWithinRange(this.colIdx);
    }

    #coordWithinRange(i) {
        return i >= 0 && i < House.SIZE;
    }

    key() {
        return `(${this.rowIdx}, ${this.colIdx})`;
    }

    toString() {
        return this.key();
    }

    static at(rowIdx, colIdx) {
        return new Cell(rowIdx, colIdx);
    }
}
