import { Cell, ReadonlyCells } from '../../../puzzle/cell';
import { CageModel } from './cageModel';

type HouseCellsIteratorProducer = (index: number) => Iterable<Cell>;

export class HouseModel {
    readonly index: number;
    readonly cells: ReadonlyCells;

    private readonly _cageMs: Array<CageModel> = [];
    private readonly _cellsIteratorProducer: HouseCellsIteratorProducer;

    constructor(index: number, cells: ReadonlyCells, cellsIteratorProducer: HouseCellsIteratorProducer) {
        this.index = index;
        this.cells = cells;
        this._cellsIteratorProducer = cellsIteratorProducer;
    }

    get cageModels(): ReadonlyArray<CageModel> {
        return this._cageMs;
    }

    addCageModel(val: CageModel) {
        this._cageMs.push(val);
    }

    removeCageModel(val: CageModel) {
        const indexToRemove = this._cageMs.indexOf(val);
        if (indexToRemove !== -1) {
            this._cageMs.splice(indexToRemove, 1);
        }
    }

    cellsIterator(): Iterable<Cell> {
        return this._cellsIteratorProducer(this.index);
    }
}
