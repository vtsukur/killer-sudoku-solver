import { Cell } from './cell';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku puzzle `Row`
 * which holds utility method that simplifies iteration over `Row`'s {@link Cell}s.
 *
 * @public
 */
export class Row {
    private constructor() {
        // Non-contructible.
    }

    /**
     * Constructs new iterator over {@link Cell}s for a `Row` with the given index
     * which iterates `Cell`s consequently from _left_ to _right_.
     *
     * Sample iteration for row with index 3 looks as follows:
     * ```
     * // (row, column)
     * (3, 0) -> (3, 1) -> (3, 2) -> ...  -> (3, 7) -> (3, 8)
     * ```
     *
     * @param row - Index of the `Row` to iterate `Cell`s for.
     *
     * @returns new iterator over {@link Cell}s for a `Row` with the given index.
     */
    static newCellsIterator(row: number) {
        return House.cellsIterator((col: number) => {
            return Cell.at(row, col);
        });
    }
}
