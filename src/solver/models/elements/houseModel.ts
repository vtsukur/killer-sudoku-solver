import { Cell } from '../../../puzzle/cell';
import { CageModel } from './cageModel';

type HouseCellsIteratorProducer = (index: number) => Iterable<Cell>;

export class HouseModel {
    readonly index: number;
    readonly cells: ReadonlyArray<Cell>;

    private readonly _cageModels: Array<CageModel> = [];
    private readonly _cellsIteratorProducer: HouseCellsIteratorProducer;

    constructor(index: number, cells: ReadonlyArray<Cell>, cellsIteratorProducer: HouseCellsIteratorProducer) {
        this.index = index;
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

    cellsIterator(): Iterable<Cell> {
        return this._cellsIteratorProducer(this.index);
    }
}
