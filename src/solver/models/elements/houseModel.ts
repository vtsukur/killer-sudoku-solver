import { Cell } from '../../../puzzle/cell';
import { CageModel } from './cageModel';

type HouseCellsIteratorProducer = (idx: number) => Iterator<Cell>;

export class HouseModel {
    readonly idx: number;
    readonly cells: ReadonlyArray<Cell>;

    private readonly _cageModels: Array<CageModel> = [];
    private readonly _cellsIteratorProducer: HouseCellsIteratorProducer;

    constructor(idx: number, cells: ReadonlyArray<Cell>, cellsIteratorProducer: HouseCellsIteratorProducer) {
        this.idx = idx;
        this.cells = cells;
        this._cellsIteratorProducer = cellsIteratorProducer;
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

    cellsIterator() {
        return this._cellsIteratorProducer(this.idx);
    }
}
