import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CageModel } from './cageModel';

type HouseCellIteratorProducer = (idx: number) => Iterator<Cell>;
type HouseCellProducer = (i: number) => Cell;

export class HouseModel {
    readonly idx: number;
    readonly cells: Array<Cell>;
    cageModels: Array<CageModel>;
    readonly cellIteratorFn: HouseCellIteratorProducer;

    constructor(idx: number, cells: Array<Cell>, cellIteratorFn: HouseCellIteratorProducer) {
        this.idx = idx;
        this.cells = cells;
        this.cageModels = [];
        this.cellIteratorFn = cellIteratorFn;
    }

    addCageModel(newCageModel: CageModel) {
        this.cageModels.push(newCageModel);
    }

    removeCageModel(cageModelToRemove: CageModel) {
        this.cageModels = this.cageModels.filter(cageModel => cageModel !== cageModelToRemove);
    }

    cellIterator() {
        return this.cellIteratorFn(this.idx);
    }

    private static newAreaIterator(valueOfFn: HouseCellProducer, max: number) {
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
        };
    }
    
    static newHouseIterator(valueOfFn: HouseCellProducer) {
        return HouseModel.newAreaIterator(valueOfFn, House.SIZE);
    }
}
