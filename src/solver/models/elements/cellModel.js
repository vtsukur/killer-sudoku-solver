import _ from 'lodash';
import { House } from '../../../puzzle/house';
import { InvalidSolverStepError } from '../../invalidSolverStateError';

export class CellModel {
    #numOpts;
    #withinCageModels;

    constructor(cell) {
        this.cell = cell;
        this.solved = false;

        this.#numOpts = new Set(_.range(House.SIZE).map(i => i + 1));
        this.#withinCageModels = new Set();
        this.placedNum = undefined;
    }

    deepCopyWithoutCageModels() {
        const copy = new CellModel(this.cell);
        copy.solved = this.solved;
        copy.#numOpts = new Set(this.#numOpts);
        copy.placedNum = this.placedNum;
        return copy;
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
        if (this.#numOpts.size === 1 && this.#numOpts.has(num)) {
            throw new InvalidSolverStepError(`Requested to delete last number option ${num} for cell ${this.cell.key}`);
        }
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
