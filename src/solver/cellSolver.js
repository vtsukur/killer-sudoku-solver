import _ from 'lodash';
import { House } from '../problem/house';

export class CellSolver {
    #numOpts

    constructor({ cell, row, column, subgrid }) {
        this.cell = cell;
        this.row = row;
        this.column = column;
        this.subgrid = subgrid;
        this.withinCagesSet = new Set();
        this.solved = false;

        this.#numOpts = new Set(_.range(House.SIZE).map(i => i + 1));
        this.placedNumber = undefined;
    }

    addWithinCage(withinCage) {
        this.withinCagesSet.add(withinCage);
    }

    removeWithinCage(withinCage) {
        this.withinCagesSet.delete(withinCage);
    }

    numOpts() {
        return this.#numOpts;
    }

    hasNumOpt(num) {
        return this.#numOpts.has(num);
    }

    deleteNumOpt(num) {
        return this.#numOpts.delete(num);
    }

    reduceNumberOptions(numOpts) {
        const removedNumOptions = new Set();
        for (const existingNumberOption of this.#numOpts) {
            if (!numOpts.has(existingNumberOption)) {
                removedNumOptions.add(existingNumberOption);
            }
        }
        for (const numToRemove of removedNumOptions) {
            this.deleteNumOpt(numToRemove);
        }
        return removedNumOptions;
    }

    placeNumber(number) {
        this.#numOpts = new Set([number]);
        this.placedNumber = number;
        this.solved = true;
    }
}
