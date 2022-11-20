import _ from 'lodash';
import { House } from '../problem/house';

export class CellSolver {
    #numOpts;
    #withinCageSolvers;

    constructor({ cell, rowSolver, columnSolver, nonetSolver }) {
        this.cell = cell;
        this.rowSolver = rowSolver;
        this.columnSolver = columnSolver;
        this.nonetSolver = nonetSolver;
        this.withinCagesSet = new Set();
        this.solved = false;

        this.#numOpts = new Set(_.range(House.SIZE).map(i => i + 1));
        this.#withinCageSolvers = new Set();
        this.placedNumber = undefined;
    }

    addWithinCage(withinCage) {
        this.withinCagesSet.add(withinCage);
    }

    removeWithinCage(withinCage) {
        this.withinCagesSet.delete(withinCage);
    }

    addWithinCageSolver(withinCageSolver) {
        this.#withinCageSolvers.add(withinCageSolver);
    }

    removeWithinCageSolver(withinCageSolver) {
        this.#withinCageSolvers.delete(withinCageSolver);
    }

    get withinCageSolvers() {
        return this.#withinCageSolvers;
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
