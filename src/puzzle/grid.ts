import { Cell } from './cell';
import { House } from './house';

export class Grid {
    static readonly SIDE_LENGTH = 9;
    static readonly CELL_COUNT = Grid.SIDE_LENGTH * Grid.SIDE_LENGTH;
    static readonly TOTAL_SUM = Grid.SIDE_LENGTH * House.SUM;

    static rowFromAbs(idx: number) {
        return Math.floor(idx / House.SIZE);
    }

    static colFromAbs(idx: number) {
        return idx % House.SIZE;
    }

    static indexWithinGrid(row: number, col: number) {
        return row * Grid.SIDE_LENGTH + col;
    }

    static newMatrix() {
        return new Array(House.SIZE).fill(undefined).map(() => new Array(House.SIZE));
    }

    static cellsIterator(): CellsIterator {
        return new CellsIterator();
    }
}

class CellsIterator implements Iterator<Cell> {
    private i = 0;

    [Symbol.iterator](): Iterator<Cell> {
        return this;
    }

    next(): IteratorResult<Cell> {
        const abs = this.i++;
        if (abs < Grid.CELL_COUNT) {
            return {
                value: Cell.at(
                    Grid.rowFromAbs(abs),
                    Grid.colFromAbs(abs),
                ),
                done: false
            };
        } else {
            return { value: undefined, done: true };
        }
    }
}
