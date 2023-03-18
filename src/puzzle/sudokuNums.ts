import { CachedNumRanges } from '../util/cachedNumRanges';

/**
 * Supportive class for Sudoku numbers.
 *
 * @public
 */
export class SudokuNums {

    /**
     * Minimum Sudoku number (`1`) which can be placed in a {@link Cell}.
     */
    static readonly MIN = 1;

    /**
     * Maximum Sudoku number (`9`) which can be placed in a {@link Cell}.
     */
    static readonly MAX = 9;

    /**
     * Range of all possible Sudoku numbers (`[1, 9]`) which can be placed in a {@link Cell}
     * in the form of readonly array.
     */
    static readonly RANGE = CachedNumRanges.ONE_TO_N_LTE_10[this.MAX + 1];

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

}
