import { CachedNumRanges } from '../solver/math/cachedNumRanges';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku `Grid`
 * which holds useful constants that describe mathematical properties of any `Grid`
 * as well as utility methods that simplify iteration over `Grid` {@link Cell}s,
 * {@link CellRowAndColumn}s and creation of supplementary ranges and matrices with `Grid`'s size.
 *
 * @public
 */
export class Grid {

    /**
     * Amount of `Cell`s on the `Grid`'s side.
     */
    static readonly SIDE_CELL_COUNT = 9;

    /**
     * Range as a readonly array of numbers from 0 to 8 to represent iteration over `Grid`'s side `Cell`s.
     */
    static readonly SIDE_INDICES_RANGE = CachedNumRanges.ZERO_TO_N_LTE_81[this.SIDE_CELL_COUNT];

    /**
     * Total amount of {@link Cell}s on the `Grid`.
     */
    static readonly CELL_COUNT = Math.imul(this.SIDE_CELL_COUNT, this.SIDE_CELL_COUNT);

    /**
     * Range as a readonly array of numbers from 0 to 80 to represent indices of all `Cell`s on the `Grid`.
     */
    static readonly CELL_INDICES_RANGE = CachedNumRanges.ZERO_TO_N_LTE_81[this.CELL_COUNT];

    /**
     * Total sum of all numbers in a `Grid`.
     */
    static readonly SUM = Math.imul(this.SIDE_CELL_COUNT, House.SUM);

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Constructs new matrix (array of arrays) of `Grid`'s size indexed by `Row` and then by `Column`.
     *
     * @returns new matrix (array of arrays) of `Grid`'s size indexed by `Row` and then by `Column`.
     *
     * @typeParam T - Type of values in the matrix.
     */
    static newMatrix<T>(): Array<Array<T>> {
        const val = new Array<Array<T>>(this.SIDE_CELL_COUNT);
        this.SIDE_INDICES_RANGE.forEach((_empty, index) => {
            val[index] = new Array<T>(this.SIDE_CELL_COUNT);
        });
        return val;
    }

}
