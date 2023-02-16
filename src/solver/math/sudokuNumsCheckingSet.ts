import { Numbers } from '../../puzzle/numbers';
import { CachedNumRanges } from './cachedNumRanges';
import { NumCheckingSet, ReadonlyNumCheckingSet } from './numCheckingSet';

export class SudokuNumsCheckingSet {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    private static readonly ALL_SUDOKU_NUMS_BINARY_STORAGE = (() => {
        let val = 0;
        CachedNumRanges.ONE_TO_N_LT_10[Numbers.MAX + 1].forEach(num => {
            val |= 1 << num;
        });
        return val;
    })();

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
        return new NumCheckingSet(SudokuNumsCheckingSet.ALL_SUDOKU_NUMS_BINARY_STORAGE ^ checkingSet.bitStore);
    }
}
