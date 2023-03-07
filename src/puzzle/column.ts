import { Cell, ReadonlyCells } from './cell';
import { Grid } from './grid';
import { House, HouseIndex } from './house';

/**
 * Supportive class for Killer Sudoku `Column`
 * which holds utility method that simplifies iteration over `Column` {@link Cell}s.
 *
 * @public
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 */
export class Column {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * {@link Cell}s for each {@link Column}
     * represented as a readonly array of {@link ReadonlyCells} indexed by {@link Column}.
     */
    static readonly CELLS: ReadonlyArray<ReadonlyCells> = (() => {
        const val = Grid.newMatrix<Cell>();
        for (const rowOfCells of Cell.GRID) {
            for (const cell of rowOfCells) {
                val[cell.col][cell.row] = cell;
            }
        }
        return val;
    })();

    /**
     * Constructs new iterator over {@link Cell}s for a `Column` with the given index
     * which iterates `Cell`s consequently from _top_ to _bottom_.
     *
     * Sample iteration for `Column` of index 3 looks as follows:
     * ```
     * // (row, column)
     * (0, 3) -> (1, 3) -> (2, 3) -> ... -> (7, 3) -> (8, 3) -> done
     * ```
     *
     * @param col - Index of the `Column` to iterate `Cell`s for.
     *
     * @returns new iterator over {@link Cell}s for a `Column` with the given index.
     *
     * @throws {InvalidProblemDefError} if `Column` index is outside of valid [0, 9) range.
     */
    static newCellsIterator(col: HouseIndex) {
        House.validateIndex(col);
        return House.newCellsIterator((row: HouseIndex) => {
            return Cell.at(row, col);
        });
    }

}
