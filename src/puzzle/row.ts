import { Cell } from './cell';
import { House } from './house';

class RowAPI {
    cellsIterator(row: number) {
        return House.cellsIterator((col: number) => {
            return Cell.at(row, col);
        });
    }
}

export const Row = new RowAPI();
