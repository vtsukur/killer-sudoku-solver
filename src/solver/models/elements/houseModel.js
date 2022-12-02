import { House } from '../../../problem/house';
import { CagesAreaModel } from './cagesAreaModel';

export class HouseModel {
    #cageModels;
    #cages;

    constructor(idx, cells, cellIteratorFn) {
        this.idx = idx;
        this.cells = cells;
        this.#cageModels = [];
        this.#updateCages();
        this.cellIteratorFn = cellIteratorFn;
    }

    addCageModel(newCageModel) {
        this.#cageModels.push(newCageModel);
        this.#updateCages();
    }

    removeCageModel(cageModelToRemove) {
        this.#cageModels = this.#cageModels.filter(cageModel => cageModel !== cageModelToRemove);
        this.#updateCages();
    }

    #updateCages() {
        this.#cages = this.#cageModels.map(cageModel => cageModel.cage);
    }

    get cages() {
        return this.#cages;
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
