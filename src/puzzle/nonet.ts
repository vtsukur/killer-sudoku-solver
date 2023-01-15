import { to1DIndex, xFrom1DIndex, yFrom1DIndex } from '../util/dimensionalMatrixMath';
import { Cell } from './cell';
import { House } from './house';

class NonetAPI {
    readonly SIDE_LENGTH = 3;

    indexForCellAt(row: number, col: number) {
        return to1DIndex(
            yFrom1DIndex(col, this.SIDE_LENGTH),
            yFrom1DIndex(row, this.SIDE_LENGTH),
            this.SIDE_LENGTH);
    }

    cellsIterator(nonet: number) {
        return House.cellsIterator((index: number) => {
            const row = to1DIndex(
                yFrom1DIndex(index, this.SIDE_LENGTH),
                yFrom1DIndex(nonet, this.SIDE_LENGTH),
                this.SIDE_LENGTH);
            const col = to1DIndex(
                xFrom1DIndex(index, this.SIDE_LENGTH),
                xFrom1DIndex(nonet, this.SIDE_LENGTH),
                this.SIDE_LENGTH);
            return Cell.at(row, col);
        });
    }
}

export const Nonet = new NonetAPI();
