import { Cell } from './cell';

export class Cage {
    #cellsSet;

    constructor(sum, cells) {
        this.sum = sum;
        this.cells = cells;
        this.#cellsSet = new Set(cells.map(cell => cell.key()));

        this.isSingleCellCage = this.cellCount === 1;
        this.isWithinRow = this.isSingleCellCage || this.#isSameForAll(cell => cell.rowIdx);
        this.isWithinColumn = this.isSingleCellCage || this.#isSameForAll(cell => cell.colIdx);
        this.isWithinSubgrid = this.isSingleCellCage || this.#isSameForAll(cell => cell.nonetIdx);
        this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinSubgrid;
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
        return `${this.sum} [${this.cells.join(', ')}]`;
    }

    toString() {
        return this.key();
    }

    static Builder = class {
        constructor(sum) {
            this.sum = sum;
            this.cells = [];
        }

        cell(rowIdx, cellIdx) {
            this.cells.push(Cell.at(rowIdx, cellIdx));
            return this;
        }

        mk() {
            return new Cage(this.sum, this.cells);
        }
    }

    static of(sum) {
        return new this.Builder(sum);
    }
}
