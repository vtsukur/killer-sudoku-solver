import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CageModel } from './cageModel';

type HouseCellsIteratorProducer = (idx: number) => Iterator<Cell>;
type HouseCellProducer = (i: number) => Cell;

export class HouseModel {
    readonly idx: number;
    readonly cells: ReadonlyArray<Cell>;

    private readonly _cageModels: Array<CageModel>;
    private readonly _cellsIteratorProducer: HouseCellsIteratorProducer;

    constructor(idx: number, cells: ReadonlyArray<Cell>, cellsIteratorProducer: HouseCellsIteratorProducer) {
        this.idx = idx;
        this.cells = cells;
        this._cageModels = [];
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
    
    protected static newCellsIterator(houseCellProducer: HouseCellProducer): Iterator<Cell> {
        return new CellsIterator(houseCellProducer);
    }
}

class CellsIterator implements Iterator<Cell> {
    private readonly _houseCellProducer: HouseCellProducer;
    private _indexWithinHouse = 0;

    constructor(houseCellProducer: HouseCellProducer) {
        this._houseCellProducer = houseCellProducer;
    }

    [Symbol.iterator](): Iterator<Cell> {
        return this;
    }

    next(): IteratorResult<Cell> {
        if (this._indexWithinHouse < House.SIZE) {
            return this.nextIterableResult(this._indexWithinHouse++);
        } else {
            return CellsIterator.final();
        }
    }

    private nextIterableResult(indexWithinHouse: number) {
        return {
            value: this._houseCellProducer(indexWithinHouse),
            done: false
        };
    }

    private static final(): IteratorResult<Cell> {
        return {
            value: undefined,
            done: true
        };
    }
}
