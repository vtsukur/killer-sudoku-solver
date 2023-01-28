import { Cell } from './cell';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku puzzle `Column`
 * which holds utility method that simplifies iteration over `Column`'s {@link Cell}s.
 *
 * @public
 */
export class Column {
    private constructor() {
        // Non-contructible.
    }

    /**
     * Constructs new iterator over {@link Cell}s for a `Column` with the given index
     * which iterates `Cell`s consequently from _top_ to _bottom_.
     *
     * Sample iteration for column with index 3 looks as follows:
     * ```
     * // (row, column)
     * (0, 3) -> (1, 3) -> (2, 3) -> ...  -> (7, 3) -> (8, 3)
     * ```
     *
     * @param col - Index of the `Column` to iterate `Cell`s for.
     *
     * @returns new iterator over {@link Cell}s for a `Column` with the given index.
     */
    static newCellsIterator(col: number) {
        return House.cellsIterator((row: number) => {
            return Cell.at(row, col);
        });
    }
}
