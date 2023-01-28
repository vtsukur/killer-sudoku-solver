import { Cell } from './cell';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku puzzle row
 * which holds utility method that simplifies iteration over row's cells.
 *
 * @public
 */
export class Row {
    private constructor() {
        // Non-contructible.
    }

    static cellsIterator(row: number) {
        return House.cellsIterator((col: number) => {
            return Cell.at(row, col);
        });
    }
}
