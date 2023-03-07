import { CachedNumRanges } from '../solver/math/cachedNumRanges';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku `Grid`
 * which defines useful mathematical properties of any {@link Grid}
 * as well as utility methods that simplify iteration over {@link Grid} {@link Cell}s
 * and creation of matrices with {@link Grid}'s size.
 *
 * @public
 */
export class Grid {

    /**
     * Amount of `Cell`s on the {@link Grid}'s side.
     */
    static readonly SIDE_CELL_COUNT = 9;

    /**
     * Range as a readonly array of `[0, {@link Grid.SIDE_CELL_COUNT})` numbers
     * to help in iterating over `Cell`s on the {@link Grid}'s side.
     */
    static readonly SIDE_INDICES_RANGE = CachedNumRanges.ZERO_TO_N_LTE_81[this.SIDE_CELL_COUNT];

    /**
     * Total amount of {@link Cell}s on the {@link Grid}.
     */
    static readonly CELL_COUNT = Math.imul(this.SIDE_CELL_COUNT, this.SIDE_CELL_COUNT);

    /**
     * Range as a readonly array of `[0, {@link Grid.CELL_COUNT}]` numbers
     * to help in iterating over all `Cell`s on the {@link Grid}.
     */
    static readonly CELL_INDICES_RANGE = CachedNumRanges.ZERO_TO_N_LTE_81[this.CELL_COUNT];

    /**
     * Total sum of all numbers in a {@link Grid}.
     */
    static readonly SUM = Math.imul(this.SIDE_CELL_COUNT, House.SUM);

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Constructs new matrix (array of arrays) of {@link Grid.SIDE_CELL_COUNT} x {@link Grid.SIDE_CELL_COUNT} size
     * indexed by `Row` and then by `Column`.
     *
     * @returns New matrix (array of arrays) of {@link Grid.SIDE_CELL_COUNT} x {@link Grid.SIDE_CELL_COUNT} size
     * indexed by `Row` and then by `Column`.
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
