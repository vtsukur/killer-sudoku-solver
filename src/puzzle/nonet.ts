import { to1D, rowFrom1D, colFrom1D } from '../util/dimensionalMatrixMath';
import { Cell } from './cell';
import { House } from './house';

const NONET_SIDE_LENGTH = 3;

class NonetAPI {
    readonly SIDE_LENGTH = NONET_SIDE_LENGTH;

    indexForCellAt(row: number, col: number) {
        return to1D(
            colFrom1D(row, NONET_SIDE_LENGTH),
            colFrom1D(col, NONET_SIDE_LENGTH),
            NONET_SIDE_LENGTH);
    }

    cellsIterator(nonet: number) {
        return House.cellsIterator((index: number) => {
            const row = to1D(
                colFrom1D(nonet, NONET_SIDE_LENGTH),
                colFrom1D(index, NONET_SIDE_LENGTH),
                NONET_SIDE_LENGTH);
            const col = to1D(
                rowFrom1D(nonet, NONET_SIDE_LENGTH),
                rowFrom1D(index, NONET_SIDE_LENGTH),
                NONET_SIDE_LENGTH);
            return Cell.at(row, col);
        });
    }
}

export const Nonet = Object.freeze(new NonetAPI());
