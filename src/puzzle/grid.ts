import { Cell } from './cell';
import { House } from './house';

export namespace Grid {
    export const SIDE_LENGTH = 9;
    export const CELL_COUNT = Grid.SIDE_LENGTH * Grid.SIDE_LENGTH;
    export const TOTAL_SUM = Grid.SIDE_LENGTH * House.SUM;

    export function rowFromAbs(idx: number) {
        return Math.floor(idx / House.SIZE);
    }

    export function colFromAbs(idx: number) {
        return idx % House.SIZE;
    }

    export function newMatrix() {
        return new Array(House.SIZE).fill(undefined).map(() => new Array(House.SIZE));
    }

    export function cellsIterator(): CellsIterator {
        let i = 0;
        return new CellsIterator();
    }

    class CellsIterator implements Iterator<Cell> {
        private i: number = 0;

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
}
