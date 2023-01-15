import { Cell } from './cell';

export type CellProducer = (index: number) => Cell;

export class CellsIterator implements Iterator<Cell> {
    private _index = 0;
    private readonly _cellProducer: CellProducer;
    private readonly _max: number;

    constructor(cellProducer: CellProducer, max: number) {
        this._cellProducer = cellProducer;
        this._max = max;
    }

    [Symbol.iterator](): Iterator<Cell> {
        return this;
    }

    next(): IteratorResult<Cell> {
        if (this._index < this._max) {
            return this.nextIterableResult(this._index++);
        } else {
            return CellsIterator.final();
        }
    }

    private nextIterableResult(index: number) {
        return {
            value: this._cellProducer(index),
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
