import { xFrom1D, yFrom1D } from '../util/dimensionalMatrixMath';
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
                yFrom1D(index, Grid.SIDE_LENGTH),
                xFrom1D(index, Grid.SIDE_LENGTH),
            );
        }, Grid.CELL_COUNT);
    }

    newMatrix() {
        return new Array(this.SIDE_LENGTH).fill(undefined).map(() => new Array(this.SIDE_LENGTH));
    }
}

export const Grid = new GridAPI();
