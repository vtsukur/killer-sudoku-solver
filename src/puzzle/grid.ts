import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { House } from './house';

class GridAPI {
    readonly SIDE_LENGTH = 9;
    readonly CELL_COUNT = this.SIDE_LENGTH * this.SIDE_LENGTH;
    readonly TOTAL_SUM = this.SIDE_LENGTH * House.SUM;

    indexOfCellAt(row: number, col: number) {
        return row * this.SIDE_LENGTH + col;
    }

    cellsIterator(): CellsIterator {
        return new CellsIterator((index: number) => {
            return Cell.at(
                rowFromAbs(index),
                colFromAbs(index),
            );
        }, Grid.CELL_COUNT);
    }

    newMatrix() {
        return new Array(this.SIDE_LENGTH).fill(undefined).map(() => new Array(this.SIDE_LENGTH));
    }
}

function rowFromAbs(idx: number) {
    return Math.floor(idx / Grid.SIDE_LENGTH);
}

function colFromAbs(idx: number) {
    return idx % Grid.SIDE_LENGTH;
}

export const Grid = new GridAPI();
