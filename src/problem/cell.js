import { NONET_SIDE_LENGTH, HOUSE_SIZE } from './constants';

export class Cell {
    constructor(rowIdx, colIdx) {
        this.rowIdx = rowIdx;
        this.colIdx = colIdx;
        this.subgridIdx = Math.floor(rowIdx / NONET_SIDE_LENGTH) * NONET_SIDE_LENGTH + Math.floor(colIdx / NONET_SIDE_LENGTH);
    }

    isWithinRange() {
        return this.#coordWithinRange(this.rowIdx) && this.#coordWithinRange(this.colIdx);
    }

    #coordWithinRange(i) {
        return i >= 0 && i < HOUSE_SIZE;
    }

    key() {
        return `(${this.rowIdx}, ${this.colIdx})`;
    }

    toString() {
        return this.key();
    }
}
