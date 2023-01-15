import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CageModel } from './cageModel';

type HouseCellIteratorProducer = (idx: number) => Iterator<Cell>;
type HouseCellProducer = (i: number) => Cell;

export class HouseModel {
    readonly idx: number;
    readonly cells: ReadonlyArray<Cell>;

    private readonly _cageModels: Array<CageModel>;
    private readonly _cellIteratorProducer: HouseCellIteratorProducer;

    constructor(idx: number, cells: Array<Cell>, cellIteratorProducer: HouseCellIteratorProducer) {
        this.idx = idx;
        this.cells = cells;
        this._cageModels = [];
        this._cellIteratorProducer = cellIteratorProducer;
    }

    get cageModels(): ReadonlyArray<CageModel> {
        return this._cageModels;
    }

    addCageModel(val: CageModel) {
        this._cageModels.push(val);
    }

    removeCageModel(val: CageModel) {
        const indexToRemove = this._cageModels.indexOf(val);
        if (indexToRemove !== -1) {
            this._cageModels.splice(indexToRemove, 1);
        }
    }

    cellIterator() {
        return this._cellIteratorProducer(this.idx);
    }
    
    static newHouseIterator(valueOfFn: HouseCellProducer) {
        return HouseModel.newAreaIterator(valueOfFn, House.SIZE);
    }

    private static newAreaIterator(houseCellProducer: HouseCellProducer, max: number) {
        let i = 0;
        return {
            [Symbol.iterator]() { return this; },
            next() {
                if (i < max) {
                    return { value: houseCellProducer(i++), done: false };
                } else {
                    return { value: max, done: true };
                }
            }
        };
    }
}
