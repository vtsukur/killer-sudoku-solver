import _ from 'lodash';
import { House } from '../../../problem/house';

export class CellModel {
    #numOpts;
    #withinCageModels;

    constructor({ cell, rowModel, columnModel, nonetSolver }) {
        this.cell = cell;
        this.rowModel = rowModel;
        this.columnModel = columnModel;
        this.nonetSolver = nonetSolver;
        this.solved = false;

        this.#numOpts = new Set(_.range(House.SIZE).map(i => i + 1));
        this.#withinCageModels = new Set();
        this.placedNum = undefined;
    }

    addWithinCageModel(withinCageModel) {
        this.#withinCageModels.add(withinCageModel);
    }

    removeWithinCageModel(withinCageModel) {
        this.#withinCageModels.delete(withinCageModel);
    }

    get withinCageModels() {
        return this.#withinCageModels;
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
