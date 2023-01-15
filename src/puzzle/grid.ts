import { Cell } from './cell';
import { House } from './house';

class GridAPI {
    readonly SIDE_LENGTH = 9;
    readonly CELL_COUNT = this.SIDE_LENGTH * this.SIDE_LENGTH;
    readonly TOTAL_SUM = this.SIDE_LENGTH * House.SUM;

    indexOfCellAt(row: number, col: number) {
        return row * this.SIDE_LENGTH + col;
    }

    cellsIterator(): CellsIterator {
        return new CellsIterator();
    }

    newMatrix() {
        return new Array(this.SIDE_LENGTH).fill(undefined).map(() => new Array(this.SIDE_LENGTH));
    }
}

class CellsIterator implements Iterator<Cell> {
    private _indexWithinGrid = 0;

    [Symbol.iterator](): Iterator<Cell> {
        return this;
    }

    next(): IteratorResult<Cell> {
        if (this._indexWithinGrid < Grid.CELL_COUNT) {
            return CellsIterator.nextIterableResult(this._indexWithinGrid++);
        } else {
            return CellsIterator.final();
        }
    }

    private static nextIterableResult(indexWithinGrid: number) {
        return {
            value: Cell.at(
                rowFromAbs(indexWithinGrid),
                colFromAbs(indexWithinGrid),
            ),
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

function rowFromAbs(idx: number) {
    return Math.floor(idx / Grid.SIDE_LENGTH);
}

function colFromAbs(idx: number) {
    return idx % Grid.SIDE_LENGTH;
}

export const Grid = new GridAPI();
