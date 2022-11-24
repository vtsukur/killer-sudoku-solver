import { Cage } from '../../../problem/cage';
import { House } from '../../../problem/house';
import { CagesAreaModel } from './cagesAreaModel';

export class HouseModel {
    #cagesAreaModel;

    constructor(idx, cells, inputCages = [], cellIteratorFn) {
        this.idx = idx;
        this.cells = cells;
        this.cages = inputCages;
        this.#cagesAreaModel = new CagesAreaModel(this.cages);
        this.cellIteratorFn = cellIteratorFn;
    }

    addCage(newCage) {
        this.cages.push(newCage);
        this.#cagesAreaModel = new CagesAreaModel(this.cages);
    }

    removeCage(cageToRemove) {
        this.cages = this.cages.filter(cage => cage !== cageToRemove);
        this.#cagesAreaModel = new CagesAreaModel(this.cages);
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
