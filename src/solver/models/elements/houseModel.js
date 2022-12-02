import { House } from '../../../problem/house';

export class HouseModel {
    #cageModels;

    constructor(idx, cells, cellIteratorFn) {
        this.idx = idx;
        this.cells = cells;
        this.#cageModels = [];
        this.cellIteratorFn = cellIteratorFn;
    }

    addCageModel(newCageModel) {
        this.#cageModels.push(newCageModel);
    }

    removeCageModel(cageModelToRemove) {
        this.#cageModels = this.#cageModels.filter(cageModel => cageModel !== cageModelToRemove);
    }

    get cageModels() {
        return this.#cageModels;
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
        return HouseModel.#newAreaIterator(valueOfFn, House.SIZE);
    }
}
