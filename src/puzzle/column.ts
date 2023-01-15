import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { House } from './house';

class ColumnAPI {
    cellsIterator(col: number) {
        return new CellsIterator((row: number) => {
            return Cell.at(row, col);
        }, House.SIZE);
    }
}

export const Column = new ColumnAPI();
