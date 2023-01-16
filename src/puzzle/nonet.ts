import { to1D, rowFrom1D, colFrom1D } from '../util/dimensionalMatrixMath';
import { Cell } from './cell';
import { House } from './house';

class NonetAPI {
    readonly SIDE_LENGTH = 3;

    indexForCellAt(row: number, col: number) {
        return to1D(
            colFrom1D(row, this.SIDE_LENGTH),
            colFrom1D(col, this.SIDE_LENGTH),
            this.SIDE_LENGTH);
    }

    cellsIterator(nonet: number) {
        return House.cellsIterator((index: number) => {
            const row = to1D(
                colFrom1D(nonet, this.SIDE_LENGTH),
                colFrom1D(index, this.SIDE_LENGTH),
                this.SIDE_LENGTH);
            const col = to1D(
                rowFrom1D(nonet, this.SIDE_LENGTH),
                rowFrom1D(index, this.SIDE_LENGTH),
                this.SIDE_LENGTH);
            return Cell.at(row, col);
        });
    }
}

export const Nonet = Object.freeze(new NonetAPI());
