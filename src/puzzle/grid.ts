import * as _ from 'lodash';
import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku `Grid`
 * which holds useful constants that describe mathematical properties of any `Grid`
 * as well as utility methods that simplify iteration over `Grid` {@link Cell}s
 * and creation of matrices with `Grid`'s size.
 *
 * @public
 */
export class Grid {

    /**
     * Amount of {@link Cell}s on `Grid`'s side.
     */
    static readonly SIDE_CELL_COUNT = 9;

    /**
     * Total amount of {@link Cell}s in a `Grid`.
     */
    static readonly CELL_COUNT = this.SIDE_CELL_COUNT * this.SIDE_CELL_COUNT;

    /**
     * Total sum of all numbers in a `Grid`.
     */
    static readonly SUM = this.SIDE_CELL_COUNT * House.SUM;

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Constructs new iterator over `Grid`'s {@link Cell}s
     * which iterates consequently from _top left_ `Cell` of the `Grid` to the _right bottom_ one.
     *
     * Rows are iterated consequently from first to last (a.k.a. _top_ to _bottom_).
     * Each row is iterated starting with its first column consequently to the last one (a.k.a. _left_ to _right_).
     * Row is iterated fully before proceeding to the next one.
     *
     * Iteration looks as follows:
     * ```
     * // (row, column)
     * (0, 0) -> (0, 1) -> (0, 2) -> ...  -> (0, 7) -> (0, 8) -> (1, 0) -> (1, 1) -> ... -> (8, 8) -> done
     * ```
     *
     * @returns new iterator over `Grid`'s {@link Cell}s.
     */
    static newCellsIterator(): CellsIterator {
        return new CellsIterator((index: number) => {
            return Cell.at(
                Math.floor(index / Grid.SIDE_CELL_COUNT),
                index % Grid.SIDE_CELL_COUNT
            );
        }, Grid.CELL_COUNT);
    }

    /**
     * Constructs new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
     *
     * @returns new matrix (array of arrays) of `Grid`'s size indexed by row and then by column.
     */
    static newMatrix() {
        return new Array(this.SIDE_CELL_COUNT).fill(undefined).map(() => {
            return new Array(this.SIDE_CELL_COUNT);
        });
    }

    /**
     * Constructs new range as an array of numbers from 0 to 8 to represent iteration over `Grid`'s side `Cell`s.
     *
     * @returns new range as an array of numbers from 0 to 8 to represent iteration over `Grid`'s side `Cell`s.
     *
     */
    static zeroTo8Range(): ReadonlyArray<number> {
        return _.range(Grid.SIDE_CELL_COUNT);
    }
}
