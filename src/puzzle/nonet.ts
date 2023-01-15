import { Cell } from './cell';
import { House } from './house';

class NonetAPI {
    readonly SIDE_LENGTH = 3;

    indexForCellAt(row: number, col: number) {
        return Math.floor(row / this.SIDE_LENGTH) * this.SIDE_LENGTH + Math.floor(col / this.SIDE_LENGTH);
    }

    cellsIterator(nonet: number) {
        return House.cellsIterator((index: number) => {
            const nonetStartingRow = Math.floor(nonet / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const nonetStartingCol = (nonet % Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const row = nonetStartingRow + Math.floor(index / Nonet.SIDE_LENGTH);
            const col = nonetStartingCol + index % Nonet.SIDE_LENGTH;
            return Cell.at(row, col);
        });
    }
}

export const Nonet = new NonetAPI();
