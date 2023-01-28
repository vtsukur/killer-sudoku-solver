import { Cell } from './cell';
import { House, HouseIndex } from './house';

/**
 * Supportive class for Killer Sudoku `Row`
 * which holds utility method that simplifies iteration over `Row` {@link Cell}s.
 *
 * @public
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 */
export class Row {
    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Constructs new iterator over {@link Cell}s for a `Row` with the given index
     * which iterates `Cell`s consequently from _left_ to _right_.
     *
     * Sample iteration for `Row` with index 3 looks as follows:
     * ```
     * // (row, column)
     * (3, 0) -> (3, 1) -> (3, 2) -> ...  -> (3, 7) -> (3, 8) -> done
     * ```
     *
     * @param row - Index of the `Row` to iterate `Cell`s for.
     *
     * @returns new iterator over {@link Cell}s for a `Row` with the given index.
     */
    static newCellsIterator(row: HouseIndex) {
        return House.newCellsIterator((col: HouseIndex) => {
            return Cell.at(row, col);
        });
    }
}
