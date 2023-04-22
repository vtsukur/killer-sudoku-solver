import { House } from '../../puzzle/house';
import { CachedNumRanges } from '../../util/cachedNumRanges';
import { CombosSet, PowersOf2Lut, ReadonlyCombosSet, ReadonlyCombosSets, ReadonlySudokuNumsSet, SudokuNumsSet } from '../sets';
import { Combo, ReadonlyCombos } from './combo';

/**
 * Combinatorics of unique numbers (addends) to form a sum using precomputed values.
 *
 * @public
 */
export class SumCombinatorics {

    /**
     * Array of combinations of unique numbers to form a sum.
     */
    readonly val: ReadonlyCombos;

    /**
     * Permutations of combinations of nonrepeating numbers to form a sum.
     *
     * Each permutation as represented as a readonly array with single element of a {@link Combo}.
     *
     * Used mainly for performance reasons as a cache to avoid construction overhead
     * in implementation of `Combinatorics` types.
     */
    readonly perms: ReadonlyArray<ReadonlyCombos>;

    /**
     * {@link val} wrapped in a single-element array
     * so that it is easy to consume it when it needs to be a part of multiple combinations logic.
     *
     * Used mainly for performance reasons as a cache to avoid construction overhead
     * in implementation of `Combinatorics` types.
     */
    readonly arrayedVal: ReadonlyArray<ReadonlyCombos>;

    readonly combosSet: ReadonlyCombosSet;

    readonly combosSets: ReadonlyCombosSets;

    readonly allNumsSet: ReadonlySudokuNumsSet;

    readonly combosLut: PowersOf2Lut<Combo>;
    readonly combosNumsSetLut: PowersOf2Lut<ReadonlySudokuNumsSet>;

    static readonly BY_COUNT_BY_SUM: ReadonlyArray<ReadonlyArray<SumCombinatorics>> = (() => {
        const combosMap = new Array<Array<Array<Combo>>>(10);
        for (const count of CachedNumRanges.ONE_TO_N_LTE_10[SudokuNumsSet.MAX_NUM_PLUS_1]) {
            combosMap[count] = CachedNumRanges.ZERO_TO_N_LTE_81[House.SUM_PLUS_1].map(() => []);
        }

        for (const combo of Combo.INSTANCES) {
            if (combo === undefined) continue;
            const count = combo.nums.length;
            const sum = combo.nums.reduce((prev, current) => prev + current, 0);
            combosMap[count][sum].push(combo);
        }

        const val = new Array<Array<SumCombinatorics>>(10);
        for (const count of CachedNumRanges.ONE_TO_N_LTE_10[SudokuNumsSet.MAX_NUM_PLUS_1]) {
            val[count] = combosMap[count].map(combosPerSum => new SumCombinatorics(combosPerSum.sort((a, b) => a.index - b.index)));
        }

        return val;
    })();

    /**
     * Constucts new combinations of unique numbers to form a sum.
     *
     * @param val - Array of combinations of unique numbers to form a sum.
     */
    private constructor(val: ReadonlyCombos) {
        this.val = val;
        const allNumsSet = SudokuNumsSet.newEmpty();
        for (const combo of val) {
            allNumsSet.addAll(combo.numsSet);
        }
        this.allNumsSet = allNumsSet;
        this.perms = val.map(combo => [ combo ]);
        this.arrayedVal = [ val ];
        this.combosSet = CombosSet.from(this, val);
        this.combosSets = [ this.combosSet ];
        this.combosLut = new PowersOf2Lut();
        this.combosNumsSetLut = new PowersOf2Lut();
        val.forEach((combo, index) => {
            this.combosLut.set(index, combo);
            this.combosNumsSetLut.set(index, combo.numsSet);
        });
    }

    static readonly MAX_SUM_OF_CAGE_3 = 24;

}
