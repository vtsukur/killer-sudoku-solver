import { to1D, rowFrom1D, colFrom1D } from '../util/dimensionalMatrixMath';
import { Cell } from './cell';
import { House, HouseIndex } from './house';

/**
 * Supportive class for Killer Sudoku `Nonet`
 * which holds utility method that simplifies iteration over `Nonet` {@link Cell}s.
 *
 * @public
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
     * Determines index of `Nonet` to which given {@link Cell} belongs to.
     *
     * `Nonet`s are indexed from _left_ to _right_ and from _top_ to _bottom_ as follows:
     * ```
     * 0 1 2
     * 3 4 5
     * 6 7 8
     * ```
     *
     * @param row - `Cell`'s row index.
     * @param col - `Cell`'s column index.
     *
     * @returns index of `Nonet` to which given {@link Cell} belongs to.
     */
    static indexForCellAt(row: HouseIndex, col: HouseIndex): HouseIndex {
        return to1D(
            colFrom1D(row, Nonet.SIDE_CELL_COUNT),
            colFrom1D(col, Nonet.SIDE_CELL_COUNT),
            Nonet.SIDE_CELL_COUNT);
    }

    /**
     * Constructs new iterator over {@link Cell}s for a `Nonet` with the given index
     * which iterates consequently from _top left_ `Cell` of the `Nonet` to the _right bottom_ one.
     *
     * Rows are iterated consequently from first to last (a.k.a. _top_ to _bottom_).
     * Each row is iterated starting with its first column consequently to the last one (a.k.a. _left_ to _right_).
     * Row is iterated fully before proceeding to the next one.
     *
     * Sample iteration for `Nonet` with index 3 looks as follows:
     * ```
     * // (row, column)
     * (3, 0) -> (3, 1) -> (3, 2) -> (4, 0) -> (4, 1) -> (4, 2) -> (5, 0) -> (5, 1) -> (5, 2) -> done
     * ```
     *
     * @param nonet - Index of the `Nonet` to iterate `Cell`s for.
     *
     * @returns new iterator over {@link Cell}s for a `Nonet` with the given index.
     */
    static newCellsIterator(nonet: HouseIndex) {
        return House.newCellsIterator((index: number) => {
            const row = to1D(
                colFrom1D(nonet, Nonet.SIDE_CELL_COUNT),
                colFrom1D(index, Nonet.SIDE_CELL_COUNT),
                Nonet.SIDE_CELL_COUNT);
            const col = to1D(
                rowFrom1D(nonet, Nonet.SIDE_CELL_COUNT),
                rowFrom1D(index, Nonet.SIDE_CELL_COUNT),
                Nonet.SIDE_CELL_COUNT);
            return Cell.at(row, col);
        });
    }
}
