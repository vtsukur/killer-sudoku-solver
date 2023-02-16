import { Numbers } from '../../puzzle/numbers';
import { CachedNumRanges } from './cachedNumRanges';
import { NumCheckingSet, ReadonlyNumCheckingSet } from './numCheckingSet';

export class SudokuNumsCheckingSet {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    // Numbers from 1 to 9 are marked as `1` bits on respective positions.
    private static readonly ALL_SUDOKU_NUMS_BIT_STORE = CachedNumRanges.ONE_TO_N_LT_10[Numbers.MAX + 1].reduce(
        (prev, current) => prev | 1 << current, 0
    );

    /**
     * Returns new checking set with Sudoku numbers which are NOT present in the current checking set.
     *
     * For example, if a checking set has numbers [1, 2, 5, 9] then
     * the remaining checking set of numbers will be [3, 4, 6, 7, 8].
     *
     * @param checkingSet - The nums checking set to construct new checking set with remaining numbers from.
     *
     * @returns new checking set with Sudoku numbers which are NOT present in the current checking set.
     */
    static remainingOf(checkingSet: ReadonlyNumCheckingSet): NumCheckingSet {
        //
        // Applying bitwise XOR on the bit store of `checkingSet` and the constant bit store with all Sudoku numbers
        // to convert `1`+`0` bits into `1`s (to include number) and `1`+`1` bits into `0`s (to exclude number).
        //
        // Example:
        // ```
        //      ALL_SUDOKU_NUMS_BIT_STORE                        = 0b111111111
        //      checkingSet.bitStore                             = 0b011010001
        //      ALL_SUDOKU_NUMS_BIT_STORE ^ checkingSet.bitStore = 0b100101110 (inverses `checkingSet.bitStore`)
        //
        // ```
        //
        return new NumCheckingSet(SudokuNumsCheckingSet.ALL_SUDOKU_NUMS_BIT_STORE ^ checkingSet.bitStore);
    }
}
