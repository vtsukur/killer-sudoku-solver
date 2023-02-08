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

const shortCircuitForNoCagesCase: ComputeFn = () => {
    return EMPTY_INSTANCE;
};

const shortCircuitFor1CageCase: ComputeFn = (cages) => {
    const singleCage = cages[0];
    const singleCageCombos = combosForSum(singleCage.sum, singleCage.cellCount);
    return {
        perms: singleCageCombos.perms,
        combos: singleCageCombos.arrayedVal,
    };
};

const computeForSeveralCages: ComputeFn = (cages) => {
    const combosForCages = cages.map(cage => combosForSum(cage.sum, cage.cellCount));

    const perms = new Array<ReadonlyCombos>();
    const stack = new Array<Combo>(cages.length);
    const numFlags = new FastNumSet();

    function combosRecursive_0(sumCombos: SumCombos, step: number) {
        for (const comboForSum of sumCombos.val) {
            stack[step] = comboForSum;

            numFlags.add(comboForSum.fastNumSet);
            combosRecursive(step + 1);
            numFlags.remove(comboForSum.fastNumSet);
        }
    }

    function combosRecursive_i(sumCombos: SumCombos, step: number) {
        for (const comboForSum of sumCombos.val) {
            if (numFlags.doesNotHaveAny(comboForSum.fastNumSet)) {
                stack[step] = comboForSum;

                numFlags.add(comboForSum.fastNumSet);
                combosRecursive(step + 1);
                numFlags.remove(comboForSum.fastNumSet);
            }
        }
    }

    const actualSumCombos = new Array<Array<Combo>>(cages.length);
    const actualSumCombosHash = new Array<Set<BinaryStorage>>();
    _.range(cages.length).forEach(i => {
        actualSumCombos[i] = [];
        actualSumCombosHash[i] = new Set<BinaryStorage>();
    });

    function combosRecursive_last() {
        perms.push([...stack]);
        _.range(cages.length).forEach(i => {
            actualSumCombosHash[i].add(stack[i].fastNumSet.binaryStorage);
        });
    }

    function combosRecursive_preLast_shortCircuit(sumCombos: SumCombos, step: number) {
        const lastCombo = sumCombos.get(numFlags.remaining());
        if (lastCombo !== undefined) {
            stack[step] = lastCombo;
            combosRecursive_last();
        }
    }

    const executionPipeline = new Array<(sumCombos: SumCombos, step: number) => void>(cages.length + 1);
    executionPipeline[0] = combosRecursive_0;
    const cellCount = cages.reduce((partialCellCount, a) => partialCellCount + a.cellCount, 0);

    if (cellCount === House.CELL_COUNT) {
        _.range(1, cages.length - 1).forEach(step => {
            executionPipeline[step] = combosRecursive_i;
        });
        executionPipeline[cages.length - 1] = combosRecursive_preLast_shortCircuit;
    } else {
        _.range(1, cages.length).forEach(step => {
            executionPipeline[step] = combosRecursive_i;
        });
        executionPipeline[cages.length] = combosRecursive_last;
    }

    function combosRecursive(step: number) {
        executionPipeline[step](combosForCages[step], step);
    }

    combosRecursive(0);

    _.range(cages.length).forEach(i => {
        const sumCombos = combosForCages[i];
        const actualSumCombosSet = actualSumCombosHash[i];

        for (const combo of sumCombos.val) {
            if (actualSumCombosSet.has(combo.fastNumSet.binaryStorage)) {
                actualSumCombos[i].push(combo);
            }
        }
    });

    return { combos: actualSumCombos, perms: perms };
};

const CAGE_COUNT_BASED_STRATEGIES: Array<ComputeFn> = [
    shortCircuitForNoCagesCase, // for 0 Cages
    shortCircuitFor1CageCase, // for 1 Cage
    computeForSeveralCages, // for 2 Cages
    computeForSeveralCages, // for 3 Cages
    computeForSeveralCages, // for 4 Cages
    computeForSeveralCages, // for 5 Cages
    computeForSeveralCages, // for 6 Cages
    computeForSeveralCages, // for 7 Cages
    computeForSeveralCages, // for 8 Cages
    computeForSeveralCages, // for 9 Cages
];
