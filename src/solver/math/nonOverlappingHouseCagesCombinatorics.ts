import * as _ from 'lodash';
import { ReadonlyCages } from '../../puzzle/cage';
import { House } from '../../puzzle/house';
import { joinArray } from '../../util/readableMessages';
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
     * Computed permutations of nonrepeating numbers for each {@link Cage} within the same {@link House}.
     *
     * Each permutation as represented as a readonly array of {@link Combo}s.
     * `Combo`s appear in the same order as respective `Cage`s in `cages` input of {@link computePermsAndCombos} method,
     * meaning `Cage` with index `i` in `cages` input will be mapped to the `Combo` with index `i` in each permutation.
     *
     * Numbers in each `Cage` `Combo` and each permutation are guaranteed to be nonrepeating
     * following Killer Sudoku constraint of `House` having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     */
    readonly perms: ReadonlyArray<ReadonlyCombos>;

    /**
     * Computed `Combo`s of nonrepeating numbers for each {@link Cage} which add up to `Cage`s' sums.
     *
     * Possible `Combo`s are derived from {@link perms},
     * so `Combo`s which are NOT actual for a `House` do NOT appear in this property value.
     *
     * Each value in this array is a readonly array of {@link Combo}s for respective `Cage`.
     * These arrays appear in the same order as respective `Cage`s in `cages` input of {@link computePermsAndCombos} method,
     * meaning `Cage` with index `i` in `cages` input will be mapped to the array of `Combo`s with index `i`.
     *
     * Numbers in each `Cage` `Combo` are guaranteed to be nonrepeating
     * following Killer Sudoku constraint of `House` having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     */
    readonly combos: ReadonlyArray<ReadonlyCombos>;

    private static readonly EMPTY_INSTANCE = new NonOverlappingHouseCagesCombinatorics([], []);

    private constructor(perms: ReadonlyArray<ReadonlyCombos>, combos: ReadonlyArray<ReadonlyCombos>) {
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
     * @returns Computed permutations of nonrepeating numbers for each {@link Cage} within the same {@link House}
     * and `Combo`s of nonrepeating numbers for each {@link Cage} which add up to `Cage`s' sums derived from permutations.
     *
     * Each permutation as represented as a readonly array of {@link Combo}s.
     * `Combo`s appear in the same order as respective `Cage`s in `cages` input of this method,
     * meaning `Cage` with index `i` in `cages` input will be mapped to the `Combo` with index `i` in each permutation.
     * See {@link perms}.
     *
     * Each value in the {@link combos} array is a readonly array of {@link Combo}s for respective `Cage`.
     * These arrays appear in the same order as respective `Cage`s in `cages` input of this method,
     * meaning `Cage` with index `i` in `cages` input will be mapped to the array of `Combo`s with index `i`.
     * See {@link combos}.
     *
     * @throws {RangeError} if total sum of all Cages with non-overlapping `Cell`s is above House sum of 45.
     */
    static computePermsAndCombos(cages: ReadonlyCages): NonOverlappingHouseCagesCombinatorics {
        // short circuit return to avoid initializatio overhead in case there is nothing to compute
        if (cages.length === 0) {
            return this.EMPTY_INSTANCE;
        }

        const totalSum = cages.reduce((partialSum, a) => partialSum + a.sum, 0);
        if (totalSum > House.SUM) {
            throw new RangeError(`Total sum of all Cages with non-overlapping Cells should be <= House sum of ${House.SUM}. Actual: ${totalSum}. Cages: {${joinArray(cages)}}`);
        }

        const nonOverlappingCagesCells = cages.reduce((partialCellCount, a) => partialCellCount + a.cellCount, 0);

        const combosForCages = cages.map(cage => combosForSum(cage.sum, cage.cellCount));
        if (combosForCages.length === 1) {
            return {
                perms: combosForCages[0].val.map(combo => [ combo ]),
                combos: [ combosForCages[0].val ]
            };
        }

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
        if (nonOverlappingCagesCells === House.CELL_COUNT) {
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

        return { perms: perms, combos: actualSumCombos };
    }

};
