import * as _ from 'lodash';
import { ReadonlyCages } from '../../puzzle/cage';
import { House } from '../../puzzle/house';
import { Combo, ReadonlyCombos } from './combo';
import { combosForSum, SumCombos } from './combosForSum';
import { BinaryStorage, FastNumSet } from './fastNumSet';

/**
 * Computational and data model for combinatorics of non-overlapping {@link Cage}s in the {@link House}.
 *
 * This type uses Killer Sudoku constraint
 * (_which state that a `House` has nonrepeating set of {@link Cell}`s with numbers from 1 to 9_)
 * to produce possible permutations of nonrepeating numbers for each `Cage` within the same `House`
 * and nonrepeating `Combo`s for each `Cage` derived from these permutations.
 *
 * @public
 */
export class NonOverlappingHouseCagesCombinatorics {

    /**
     * Computed `Combo`s of nonrepeating numbers for each {@link Cage} which add up to `Cage`s' sums.
     *
     * Possible `Combo`s are derived from {@link perms},
     * so `Combo`s which are NOT actual for a `House` do NOT appear in this property value.
     *
     * Each value in this array is a readonly array of {@link Combo}s for respective `Cage`.
     * These arrays appear in the same order as respective `Cage`s in `cages` input of {@link computeCombosAndPerms} method,
     * meaning `Cage` with index `i` in `cages` input will be mapped to the array of `Combo`s with index `i`.
     *
     * Numbers in each `Cage` `Combo` are guaranteed to be nonrepeating
     * following Killer Sudoku constraint of `House` having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     */
    readonly combos: ReadonlyArray<ReadonlyCombos>;

    /**
     * Computed permutations of nonrepeating numbers for each {@link Cage} within the same {@link House}.
     *
     * Each permutation as represented as a readonly array of {@link Combo}s.
     * `Combo`s appear in the same order as respective `Cage`s in `cages` input of {@link computeCombosAndPerms} method,
     * meaning `Cage` with index `i` in `cages` input will be mapped to the `Combo` with index `i` in each permutation.
     *
     * Numbers in each `Cage` `Combo` and each permutation are guaranteed to be nonrepeating
     * following Killer Sudoku constraint of `House` having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     */
    readonly perms: ReadonlyArray<ReadonlyCombos>;

    // istanbul ignore next
    private constructor(combos: ReadonlyArray<ReadonlyCombos>, perms: ReadonlyArray<ReadonlyCombos>, ) {
        this.combos = combos;
        this.perms = perms;
    }

    /**
     * Computes permutations of nonrepeating numbers for each {@link Cage} within the same {@link House}
     * and `Combo`s of nonrepeating numbers for each {@link Cage} which add up to `Cage`s' sums derived from permutations.
     *
     * Numbers in each `Cage` `Combo` and each permutation are guaranteed to be nonrepeating
     * following Killer Sudoku constraint of `House` having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     *
     * @param cages - Array of `Cage`s with non-overlapping `Cell`s that reside within the same `House`.
     *
     * `Cage`s may cover either complete set of House `Cell`s or a subset. Empty array `Cage` is also acceptable.
     *
     * For performance reasons, this method does NOT check:
     *  - if all given `Cage`s belong to the same `House`;
     *  - if `Cell`s in the given `Cage`s are non-overlapping;
     *  - if total sum of all `Cage`s is no greater than `House` sum.
     * Its up to the caller to provide valid input.
     *
     * @returns Computed permutations of nonrepeating numbers for each {@link Cage} within the same {@link House}
     * and `Combo`s of nonrepeating numbers for each {@link Cage} which add up to `Cage`s' sums derived from permutations.
     *
     * Each value in the {@link combos} array is a readonly array of {@link Combo}s for respective `Cage`.
     * These arrays appear in the same order as respective `Cage`s in `cages` input of this method,
     * meaning `Cage` with index `i` in `cages` input will be mapped to the array of `Combo`s with index `i`.
     * See {@link combos}.
     *
     * Each permutation as represented as a readonly array of {@link Combo}s.
     * `Combo`s appear in the same order as respective `Cage`s in `cages` input of this method,
     * meaning `Cage` with index `i` in `cages` input will be mapped to the `Combo` with index `i` in each permutation.
     * See {@link perms}.
     */
    static computeCombosAndPerms(cages: ReadonlyCages): NonOverlappingHouseCagesCombinatorics {
        return CAGE_COUNT_BASED_STRATEGIES[cages.length](cages);
    }
};

type ComputeFn = (cages: ReadonlyCages) => NonOverlappingHouseCagesCombinatorics;

const EMPTY_INSTANCE = {
    combos: [],
    perms: []
};

class RecursiveEnumerator {

    private readonly cages: ReadonlyCages;
    private readonly perms = new Array<ReadonlyCombos>();
    private readonly numFlags = new FastNumSet();
    private readonly stack: Array<Combo>;
    private readonly combos: Array<Array<Combo>>;
    private readonly combosHash = new Array<Set<BinaryStorage>>();
    private readonly allCageCombos: Array<SumCombos>;
    private readonly executionPipeline: Array<(sumCombos: SumCombos, step: number) => void>;

    constructor(cages: ReadonlyCages) {
        this.cages = cages;
        this.stack = new Array<Combo>(cages.length);
        this.combos = new Array<Array<Combo>>(cages.length);
        this.allCageCombos = cages.map(cage => combosForSum(cage.sum, cage.cellCount));

        this.executionPipeline = new Array(cages.length + 1);
        this.executionPipeline[0] = this.bindToThis(this.combosRecursive_0);
        const cellCount = cages.reduce((partialCellCount, a) => partialCellCount + a.cellCount, 0);

        if (cellCount === House.CELL_COUNT) {
            _.range(1, cages.length - 1).forEach(step => {
                this.executionPipeline[step] = this.bindToThis(this.combosRecursive_i);
            });
            this.executionPipeline[cages.length - 1] = this.bindToThis(this.combosRecursive_preLast_shortCircuit);
        } else {
            _.range(1, cages.length).forEach(step => {
                this.executionPipeline[step] = this.bindToThis(this.combosRecursive_i);
            });
            this.executionPipeline[cages.length] = this.bindToThis(this.combosRecursive_last);
        }

        _.range(cages.length).forEach(i => {
            this.combos[i] = [];
            this.combosHash[i] = new Set<BinaryStorage>();
        });
    }

    execute() {
        this.combosRecursive(0);

        _.range(this.cages.length).forEach(i => {
            const sumCombos = this.allCageCombos[i];
            const actualSumCombosSet = this.combosHash[i];

            for (const combo of sumCombos.val) {
                if (actualSumCombosSet.has(combo.fastNumSet.binaryStorage)) {
                    this.combos[i].push(combo);
                }
            }
        });

        return { combos: this.combos, perms: this.perms };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private bindToThis(fn: (...args: any[]) => void) {
        return fn.bind(this);
    }

    private combosRecursive(step: number) {
        this.executionPipeline[step](this.allCageCombos[step], step);
    }

    private combosRecursive_0(sumCombos: SumCombos, step: number) {
        for (const comboForSum of sumCombos.val) {
            this.stack[step] = comboForSum;

            this.numFlags.add(comboForSum.fastNumSet);
            this.combosRecursive(step + 1);
            this.numFlags.remove(comboForSum.fastNumSet);
        }
    }

    private combosRecursive_i(sumCombos: SumCombos, step: number) {
        for (const comboForSum of sumCombos.val) {
            if (this.numFlags.doesNotHaveAny(comboForSum.fastNumSet)) {
                this.stack[step] = comboForSum;

                this.numFlags.add(comboForSum.fastNumSet);
                this.combosRecursive(step + 1);
                this.numFlags.remove(comboForSum.fastNumSet);
            }
        }
    }

    private combosRecursive_last() {
        this.perms.push([...this.stack]);
        _.range(this.cages.length).forEach(i => {
            this.combosHash[i].add(this.stack[i].fastNumSet.binaryStorage);
        });
    }

    private combosRecursive_preLast_shortCircuit(sumCombos: SumCombos, step: number) {
        const lastCombo = sumCombos.get(this.numFlags.remaining());
        if (lastCombo !== undefined) {
            this.stack[step] = lastCombo;
            this.combosRecursive_last();
        }
    }
}

const shortCircuitForNoCages: ComputeFn = () => {
    return EMPTY_INSTANCE;
};

const shortCircuitFor1Cage: ComputeFn = (cages) => {
    const singleCage = cages[0];
    const singleCageCombos = combosForSum(singleCage.sum, singleCage.cellCount);
    return {
        perms: singleCageCombos.perms,
        combos: singleCageCombos.arrayedVal,
    };
};

const computeForSeveralCages: ComputeFn = (cages) => {
    return new RecursiveEnumerator(cages).execute();
};

const CAGE_COUNT_BASED_STRATEGIES: Array<ComputeFn> = [
    shortCircuitForNoCages, // for 0 Cages
    shortCircuitFor1Cage, // for 1 Cage
    computeForSeveralCages, // for 2 Cages
    computeForSeveralCages, // for 3 Cages
    computeForSeveralCages, // for 4 Cages
    computeForSeveralCages, // for 5 Cages
    computeForSeveralCages, // for 6 Cages
    computeForSeveralCages, // for 7 Cages
    computeForSeveralCages, // for 8 Cages
    computeForSeveralCages, // for 9 Cages
];
