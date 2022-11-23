import _ from 'lodash';
import { House } from '../../../problem/house';

export class CellModel {
    #numOpts;
    #withinCageSolvers;

    constructor({ cell, rowSolver, columnSolver, nonetSolver }) {
        this.cell = cell;
        this.rowSolver = rowSolver;
        this.columnSolver = columnSolver;
        this.nonetSolver = nonetSolver;
        this.solved = false;

        this.#numOpts = new Set(_.range(House.SIZE).map(i => i + 1));
        this.#withinCageSolvers = new Set();
        this.placedNum = undefined;
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

    reduceNumOptions(numOpts) {
        const removedNumOptions = new Set();
        for (const existingNumOption of this.#numOpts) {
            if (!numOpts.has(existingNumOption)) {
                removedNumOptions.add(existingNumOption);
            }
        }
        for (const numToRemove of removedNumOptions) {
            this.deleteNumOpt(numToRemove);
        }
        return removedNumOptions;
    }

    placeNum(num) {
        this.#numOpts = new Set([num]);
        this.placedNum = num;
        this.solved = true;
    }
}
