import { Cell } from './cell';
import { House } from './house';

export class Grid {
    static readonly SIDE_LENGTH = 9;
    static readonly CELL_COUNT = Grid.SIDE_LENGTH * Grid.SIDE_LENGTH;
    static readonly TOTAL_SUM = Grid.SIDE_LENGTH * House.SUM;

    private constructor() {
        //
    }

    static indexWithinGrid(row: number, col: number) {
        return row * Grid.SIDE_LENGTH + col;
    }

    static newMatrix() {
        return new Array(Grid.SIDE_LENGTH).fill(undefined).map(() => new Array(Grid.SIDE_LENGTH));
    }

    static cellsIterator(): CellsIterator {
        return new CellsIterator();
    }
}

class CellsIterator implements Iterator<Cell> {
    private indexWithinGrid = 0;

    [Symbol.iterator](): Iterator<Cell> {
        return this;
    }

    next(): IteratorResult<Cell> {
        if (this.indexWithinGrid < Grid.CELL_COUNT) {
            return CellsIterator.nextIterableResult(this.indexWithinGrid++);
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
