import { Cell, CellPosition } from './cell';
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
        return this._GRID_CELLS_TO_NONETS[row][col];
    }

    private static readonly _GRID_CELLS_TO_NONETS: ReadonlyArray<ReadonlyArray<HouseIndex>> = [
        [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ],
        [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ],
        [ 0, 0, 0, 1, 1, 1, 2, 2, 2 ],
        [ 3, 3, 3, 4, 4, 4, 5, 5, 5 ],
        [ 3, 3, 3, 4, 4, 4, 5, 5, 5 ],
        [ 3, 3, 3, 4, 4, 4, 5, 5, 5 ],
        [ 6, 6, 6, 7, 7, 7, 8, 8, 8 ],
        [ 6, 6, 6, 7, 7, 7, 8, 8, 8 ],
        [ 6, 6, 6, 7, 7, 7, 8, 8, 8 ]
    ];

    private static readonly _NONET_CELLS_ITERATOR_CACHE: ReadonlyArray<ReadonlyArray<CellPosition>> = this.buildIterationCache();

    private static buildIterationCache() {
        const val: Array<Array<CellPosition>> = Grid.new0To8Range().map(() => []);
        Grid.forEachCellPosition(cellPosition => {
            val[this._GRID_CELLS_TO_NONETS[cellPosition[0]][cellPosition[1]]].push(cellPosition);
        });
        return val;
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
     *
     * @throws {InvalidProblemDefError} if `Nonet` index is outside of valid [0, 9) range.
     */
    static newCellsIterator(nonet: HouseIndex) {
        Nonet.validateIndex(nonet);
        return House.newCellsIterator((index: number) => {
            return Cell.atPosition(Nonet._NONET_CELLS_ITERATOR_CACHE[nonet][index]);
        });
    }

    /**
     * @internal
     */
    static validateIndex(val: HouseIndex) {
        House.validateIndex(val, 'Nonet');
    }
}
