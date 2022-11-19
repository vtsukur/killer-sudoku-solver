import { Cell } from './cell';

export class Cage {
    #cellsSet;

    constructor(value, cells) {
        this.value = value;
        this.cells = cells;
        this.#cellsSet = new Set(cells.map(cell => cell.key()));

        this.isSingleCellSum = this.cellCount === 1;
        this.isWithinRow = this.isSingleCellSum || this.#isSameForAll(cell => cell.rowIdx);
        this.isWithinColumn = this.isSingleCellSum || this.#isSameForAll(cell => cell.colIdx);
        this.isWithinSubgrid = this.isSingleCellSum || this.#isSameForAll(cell => cell.subgridIdx);
        this.isWithinSegment = this.isWithinRow || this.isWithinColumn || this.isWithinSubgrid;
    }

    #isSameForAll(whatFn) {
        return new Set(this.cells.map(whatFn)).size === 1;
    }

    get cellCount() {
        return this.cells.length;
    }

    has(cell) {
        return this.#cellsSet.has(cell.key());
    }

    key() {
        return `${this.value} [${this.cells.join(', ')}]`;
    }

    toString() {
        return this.key();
    }

    static Builder = class {
        constructor(value) {
            this.value = value;
            this.cells = [];
        }

        cell(rowIdx, cellIdx) {
            this.cells.push(new Cell(rowIdx, cellIdx));
            return this;
        }

        mk() {
            return new Cage(this.value, this.cells);
        }
    }

    static of(value) {
        return new this.Builder(value);
    }
}
