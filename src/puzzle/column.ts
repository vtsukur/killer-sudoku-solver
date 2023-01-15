import { Cell } from './cell';
import { House } from './house';

class ColumnAPI {
    cellsIterator(col: number) {
        return House.cellsIterator((row: number) => {
            return Cell.at(row, col);
        });
    }
}

export const Column = new ColumnAPI();
