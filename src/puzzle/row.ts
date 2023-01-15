import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { House } from './house';

class RowAPI {
    cellsIterator(row: number) {
        return new CellsIterator((col: number) => {
            return Cell.at(row, col);
        }, House.SIZE);
    }
}

export const Row = new RowAPI();
