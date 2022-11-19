import { SUBGRID_SIDE_LENGTH, UNIQUE_SEGMENT_LENGTH } from './constants';

export class Cell {
    constructor(rowIdx, colIdx) {
        this.rowIdx = rowIdx;
        this.colIdx = colIdx;
        this.subgridIdx = Math.floor(rowIdx / SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH + Math.floor(colIdx / SUBGRID_SIDE_LENGTH);
    }

    isWithinRange() {
        return this.#coordWithinRange(this.rowIdx) && this.#coordWithinRange(this.colIdx);
    }

    #coordWithinRange(i) {
        return i >= 0 && i < UNIQUE_SEGMENT_LENGTH;
    }

    key() {
        return `(${this.rowIdx}, ${this.colIdx})`;
    }

    toString() {
        return this.key();
    }
}
