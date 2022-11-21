import { Cell } from './cell';

export class Cage {
    #cellsSet;

    constructor(sum, cells) {
        this.sum = sum;
        this.cells = [...cells];
        this.#cellsSet = new Set(cells.map(cell => cell.key));
    }

    get cellCount() {
        return this.cells.length;
    }

    has(cell) {
        return this.#cellsSet.has(cell.key);
    }

    get key() {
        return `${this.sum} [${this.cells.join(', ')}]`;
    }

    toString() {
        return this.key;
    }

    static Builder = class {
        constructor(sum) {
            this.sum = sum;
            this.cells = [];
        }

        at(row, cellIdx) {
            this.cells.push(Cell.at(row, cellIdx));
            return this;
        }

        mk() {
            return new Cage(this.sum, this.cells);
        }
    }

    static ofSum(sum) {
        return new this.Builder(sum);
    }
}
