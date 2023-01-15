import { to1D, xFrom1D, yFrom1D } from '../util/dimensionalMatrixMath';
import { Cell } from './cell';
import { House } from './house';

class NonetAPI {
    readonly SIDE_LENGTH = 3;

    indexForCellAt(row: number, col: number) {
        return to1D(
            yFrom1D(col, this.SIDE_LENGTH),
            yFrom1D(row, this.SIDE_LENGTH),
            this.SIDE_LENGTH);
    }

    cellsIterator(nonet: number) {
        return House.cellsIterator((index: number) => {
            const row = to1D(
                yFrom1D(index, this.SIDE_LENGTH),
                yFrom1D(nonet, this.SIDE_LENGTH),
                this.SIDE_LENGTH);
            const col = to1D(
                xFrom1D(index, this.SIDE_LENGTH),
                xFrom1D(nonet, this.SIDE_LENGTH),
                this.SIDE_LENGTH);
            return Cell.at(row, col);
        });
    }
}

export const Nonet = new NonetAPI();
