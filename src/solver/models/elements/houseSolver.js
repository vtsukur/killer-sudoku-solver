import { Cage } from '../../../problem/cage';
import { House } from '../../../problem/house';
import { CagesArea } from './cagesArea';

export class HouseSolver {
    #cagesArea;

    constructor(idx, cells, inputCages = [], cellIteratorFn) {
        this.idx = idx;
        this.cells = cells;
        this.cages = inputCages;
        this.#cagesArea = new CagesArea(this.cages);
        this.cellIteratorFn = cellIteratorFn;
    }

    determineResidualCage() {
        if (this.#cagesArea.sum === House.SUM && this.#cagesArea.cellsSet.size === House.SIZE) {
            return;
        }

        const residualCageCells = [];
        this.cells.forEach(cell => {
            if (!this.#cagesArea.hasNonOverlapping(cell)) {
                residualCageCells.push(cell);
            }
        });

        return new Cage(House.SUM - this.#cagesArea.sum, residualCageCells);
    }

    addCage(newCage) {
        this.cages.push(newCage);
        this.#cagesArea = new CagesArea(this.cages);
    }

    removeCage(cageToRemove) {
        this.cages = this.cages.filter(cage => cage !== cageToRemove);
        this.#cagesArea = new CagesArea(this.cages);
    }

    cellIterator() {
        return this.cellIteratorFn(this.idx);
    }

    static #newAreaIterator(valueOfFn, max) {
        let i = 0;
        return {
            [Symbol.iterator]() { return this; },
            next() {
                if (i < max) {
                    return { value: valueOfFn(i++), done: false };
                } else {
                    return { value: max, done: true };
                }
            }
        }
    }
    
    static newHouseIterator(valueOfFn) {
        return HouseSolver.#newAreaIterator(valueOfFn, House.SIZE);
    }
}
