import { Cell, ReadonlyCells } from './cell';
import { Grid } from './grid';
import { House, HouseIndex } from './house';

/**
 * Supportive class for Killer Sudoku `Nonet` (also called a `Box`)
 * which holds utility method that simplifies iteration over `Nonet` {@link Cell}s.
 *
 * @public
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 */
export class Nonet {

    /**
     * Amount of {@link Cell}s on `Nonet`'s side.
     */
    static readonly SIDE_CELL_COUNT = 3;

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * {@link Cell}s for each {@link Nonet}
     * represented as a readonly array of {@link ReadonlyCells} indexed by {@link Nonet}.
     */
    static readonly CELLS: ReadonlyArray<ReadonlyCells> = (() => {
        const val: Array<Array<Cell>> = Grid.SIDE_INDICES.map(() => []);
        for (const row of Grid.SIDE_INDICES) {
            for (const col of Grid.SIDE_INDICES) {
                val[Cell.GRID_OF_NONETS[row][col]].push(Cell.GRID[row][col]);
            }
        }
        return val;
    })();

    /**
     * Constructs new iterator over {@link Cell}s for a `Nonet` with the given index
     * which iterates consequently from _top left_ `Cell` of the `Nonet` to the _right bottom_ one.
     *
     * Rows are iterated consequently from first to last (a.k.a. _top_ to _bottom_).
     * Each row is iterated starting with its first column consequently to the last one (a.k.a. _left_ to _right_).
     * Row is iterated fully before proceeding to the next one.
     *
     * Sample iteration for `Nonet` of index 3 looks as follows:
     * ```
     * // (row, column)
     * (3, 0) -> (3, 1) -> (3, 2) -> (4, 0) -> (4, 1) -> (4, 2) -> (5, 0) -> (5, 1) -> (5, 2) -> done
     * ```
     *
     * @param nonet - Index of the `Nonet` to iterate `Cell`s for.
     *
     * @returns new iterator over {@link Cell}s for a `Nonet` with the given index.
     *
     * @throws {InvalidProblemDefError} if `Nonet` index is outside of valid [0, 9) range.
     */
    static newCellsIterator(nonet: HouseIndex) {
        House.validateIndex(nonet);
        return House.newCellsIterator(index => {
            return Nonet.CELLS[nonet][index];
        });
    }

}
