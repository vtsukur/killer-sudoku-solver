import { House } from '../../puzzle/house';
import { HouseCagesAreaModel } from '../models/elements/houseCagesAreaModel';
import { CachedNumRanges } from './cachedNumRanges';
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
     * Computed `Combo`s of nonrepeating numbers for each {@link Cage}
     * which add up to respective `Cage`s' sums.
     *
     * Possible `Combo`s are derived from {@link perms},
     * so `Combo`s which are NOT actual for a `House` do NOT appear in this property value.
     *
     * Each value in this array is a readonly array of {@link Combo}s for respective `Cage`.
     * These arrays appear in the same order as respective `Cage`s
     * in `houseCagesAreaModel` input of {@link computeCombosAndPerms} method,
     * meaning `Cage` with index `i` in `houseCagesAreaModel` input
     * will be mapped to the array element of `Combo`s with index `i`.
     *
     * Numbers in each `Cage` `Combo` are guaranteed to be nonrepeating
     * following Killer Sudoku constraint of `House` having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     */
    readonly combos: ReadonlyArray<ReadonlyCombos>;

    /**
     * Computed permutations of nonrepeating numbers for each {@link Cage} within the same {@link House}.
     *
     * Each permutation as represented as a readonly array of {@link Combo}s.
     * `Combo`s appear in the same order as respective `Cage`s
     * in `houseCagesAreaModel` input of {@link computeCombosAndPerms} method,
     * meaning `Cage` with index `i` in `houseCagesAreaModel` input
     * will be mapped to the `Combo` with index `i` in each permutation.
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
     * and `Combo`s of nonrepeating numbers for each {@link Cage}
     * which add up to respective `Cage`s' sums derived from permutations.
     *
     * Numbers in each `Cage` `Combo` and each permutation are guaranteed to be nonrepeating
     * following Killer Sudoku constraint of `House` having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     *
     * @param houseCagesAreaModel - {@link HouseCagesAreaModel} with `Cage`s having non-overlapping `Cell`s.
     *
     * `Cage`s may cover either complete set of House `Cell`s or a subset. Empty array `Cage` is also acceptable.
     *
     * For performance reasons, this method does NOT check:
     *  - if all given `Cage`s belong to the same `House`;
     *  - if `Cell`s in the given `Cage`s are non-overlapping;
     *  - if total sum of all `Cage`s is no greater than `House` sum.
     * It's up to the caller to provide valid input.
     *
     * @returns Computed permutations of nonrepeating numbers for each {@link Cage} within the same {@link House}
     * and `Combo`s of nonrepeating numbers for each {@link Cage}
     * which add up to respective `Cage`s' sums derived from permutations.
     *
     * Each value in the {@link combos} array is a readonly array of {@link Combo}s for respective `Cage`.
     * These arrays appear in the same order as respective `Cage`s
     * in `houseCagesAreaModel` input of this method,
     * meaning `Cage` with index `i` in `houseCagesAreaModel` input
     * will be mapped to the array element of `Combo`s with index `i`.
     * See {@link combos}.
     *
     * Each permutation as represented as a readonly array of {@link Combo}s.
     * `Combo`s appear in the same order as respective `Cage`s
     * in `houseCagesAreaModel` input of this method,
     * meaning `Cage` with index `i` in `houseCagesAreaModel` input
     * will be mapped to the `Combo` with index `i` in each permutation.
     * See {@link perms}.
     */
    static computeCombosAndPerms(houseCagesAreaModel: HouseCagesAreaModel): NonOverlappingHouseCagesCombinatorics {
        return CAGE_COUNT_BASED_STRATEGIES[houseCagesAreaModel.cages.length](houseCagesAreaModel);
    }
};

/**
 * Computational strategy which encapsulates quickest possible way to do enumeration
 * according to the amount of `Cage`s.
 */
type ComputeStrategyFn = (houseCagesAreaModel: HouseCagesAreaModel) => NonOverlappingHouseCagesCombinatorics;

const EMPTY_INSTANCE = {
    combos: [],
    perms: []
};

/**
 * In case there are no `Cage`s, there is nothing to compute, so the same empty readonly array is returned.
 *
 * This technique avoids extra array object construction.
 */
const shortCircuitForNoCages: ComputeStrategyFn = () => {
    return EMPTY_INSTANCE;
};

/**
 * In case there is only 1 `Cage`, the full enumeration of combinations and permutations is NOT required.
 * It is enough to enumerate only the `Combo`s for the one & only `Cage` sum and
 * trivially derive resulting combinations and permutations.
 *
 * This technique avoids heavier `Context` construction.
 */
const shortCircuitFor1Cage: ComputeStrategyFn = (houseCagesAreaModel) => {
    const singleCage = houseCagesAreaModel.cages[0];
    const singleCageCombos = combosForSum(singleCage.sum, singleCage.cellCount);
    return {
        combos: singleCageCombos.arrayedVal,
        perms: singleCageCombos.perms
    };
};

/**
 * In case there are 2 or more `Cage`s, the full enumeration of combinations and permutations is executed.
 */
const computeStrategyForSeveralCages: ComputeStrategyFn = (houseCagesAreaModel) => {
    return enumerateRecursively_main(new Context(houseCagesAreaModel));
};

/**
 * All computational strategies which encapsulate quickest possible way to do enumeration
 * according to the amount of `Cage`s.
 */
const CAGE_COUNT_BASED_STRATEGIES: Array<ComputeStrategyFn> = [
    shortCircuitForNoCages,         // for 0 `Cage`s
    shortCircuitFor1Cage,           // for 1 `Cage`
    computeStrategyForSeveralCages, // for 2 `Cage`s
    computeStrategyForSeveralCages, // for 3 `Cage`s
    computeStrategyForSeveralCages, // for 4 `Cage`s
    computeStrategyForSeveralCages, // for 5 `Cage`s
    computeStrategyForSeveralCages, // for 6 `Cage`s
    computeStrategyForSeveralCages, // for 7 `Cage`s
    computeStrategyForSeveralCages, // for 8 `Cage`s
    computeStrategyForSeveralCages, // for 9 `Cage`s
];

/**
 * Entry point to the recursive enumeration which collects permutations and computations.
 */
const enumerateRecursively_main = (ctx: Context): NonOverlappingHouseCagesCombinatorics => {
    // key work: recursive enumeration which collects permutations and efficiently marks used combinations.
    enumerateRecursively_next(ctx, 0);

    // finalization: collecting combinations from marked combinations.
    ctx.finalizeCombos();

    return { combos: ctx.combos, perms: ctx.perms };
};

/**
 * Entry point to a particular step of recursive enumeration which leverages cached enumeration pipeline.
 */
const enumerateRecursively_next = (ctx: Context, step: number) => {
    ctx.enumerationPipeline[step](ctx, ctx.allCageCombos[step], step);
};

/**
 * Supplementary function which executes next enumeration step
 * with updating the `Context`:
 *
 *  - currently used combinations are updated with the current combination before next enumeration step;
 *  - currently used numbers are updated with the current combination numbers before next enumeration step
 *  and reverted upon the recursive completion of next enumeration step.
 */
const _pushAndAdvanceEnumerationAndPop = (ctx: Context, combo: Combo, step: number) => {
    ctx.usedCombos[step] = combo;

    ctx.usedNums.add(combo.fastNumSet);
    enumerateRecursively_next(ctx, step + 1);
    ctx.usedNums.remove(combo.fastNumSet);
};

/**
 * In case enumeration is in the first step, the algorithm is trivial:
 *
 *  - pick each combination in the first `Cage`;
 *  - let enumeration proceed with each combination further;
 */
const enumerateRecursively_step0 = (ctx: Context, sumCombos: SumCombos, step: number) => {
    for (const combo of sumCombos.val) {
        _pushAndAdvanceEnumerationAndPop(ctx, combo, step);
    }
};

/**
 * In case enumeration is in the second (and further) step(s), the algorithm is just like for the first step
 * with extra check that next combination does NOT overlap with currently used numbers.
 *
 * This logic is NOT unified with the first step on purpose for performance reasons:
 * checking overlap with currently used numbers is NOT needed at all in the first step.
 */
const enumerateRecursively_step1PlusButNotLast = (ctx: Context, sumCombos: SumCombos, step: number) => {
    for (const combo of sumCombos.val) {
        if (ctx.usedNums.doesNotHaveAny(combo.fastNumSet)) {
            _pushAndAdvanceEnumerationAndPop(ctx, combo, step);
        }
    }
};

/**
 * In case enumeration is in the last step, it means next permutation is found.
 * (since overlapping combinations were skipped, non-overlapping combinations were found).
 *
 * Permutation is captured and respective combinations are marked as used.
 */
const enumerateRecursively_stepLastWithPermCaptureAndComboMark = (ctx: Context) => {
    ctx.perms.push([...ctx.usedCombos]);
    for (const i of ctx.cageIndicesRange) {
        ctx.usedCombosHashes[i].add(ctx.usedCombos[i].fastNumSet.binaryStorage);
    };
};

/**
 * In case enumeration is in the last step, and the computation is executed for the whole `House`,
 * it is possible to short circuit check of the last combination according to the numbers NOT yet in use.
 * (since `House` must contain all numbers from 1 to 9).
 *
 * If the check passes, {@link enumerateRecursively_stepLastWithPermCaptureAndComboMark} is run.
 */
const enumerateRecursively_stepLastWithShortCircuitedPermCapture = (ctx: Context, sumCombos: SumCombos, step: number) => {
    const lastCombo = sumCombos.get(ctx.usedNums.remaining());
    if (lastCombo !== undefined) {
        ctx.usedCombos[step] = lastCombo;
        enumerateRecursively_stepLastWithPermCaptureAndComboMark(ctx);
    }
};

type EnumerationStepFunction = (ctx: Context, sumCombos: SumCombos, step: number) => void;
type EnumerationPipeline = ReadonlyArray<EnumerationStepFunction>;

/**
 * Data context for full enumeration of combinations and permutations.
 */
class Context {
    readonly combos: Array<Array<Combo>>;
    readonly perms = new Array<ReadonlyCombos>();

    readonly allCageCombos: Array<SumCombos>;
    readonly cageIndicesRange: ReadonlyArray<number>;
    readonly usedCombosHashes: Array<Set<BinaryStorage>>;
    readonly enumerationPipeline: EnumerationPipeline;
    readonly usedCombos: Array<Combo>;
    readonly usedNums = new FastNumSet();

    // caching enumeration pipelines improves performance by around 5-10%
    private static _CACHED_ENUMERATION_PIPELINES_FOR_COMPLETE_HOUSE: ReadonlyArray<EnumerationPipeline> =
        Context.newEnumerationPipelines(House.CELL_COUNT + 1, Context.newEnumerationPipelineForCompleteHouse);
    private static _CACHED_ENUMERATION_PIPELINES_FOR_INCOMPLETE_HOUSE: ReadonlyArray<EnumerationPipeline> =
        Context.newEnumerationPipelines(House.CELL_COUNT, Context.newEnumerationPipelineForIncompleteHouse);

    private static newEnumerationPipelines(cellCount: number, newEnumerationPipelineFn: (cageCount: number) => EnumerationPipeline) {
        return CachedNumRanges.ZERO_TO_N_LT_81[cellCount].map(cageCount => {
            return cageCount < 2 ? [] : newEnumerationPipelineFn(cageCount);
        });
    }

    // enumeration for complete `House` is short circuited in the last step.
    private static newEnumerationPipelineForCompleteHouse(cageCount: number) {
        const pipeline = new Array<EnumerationStepFunction>(cageCount);
        const lastStepIndex = cageCount - 1;

        pipeline[0] = enumerateRecursively_step0;
        for (const step of CachedNumRanges.ONE_TO_N_LT_10[lastStepIndex]) {
            pipeline[step] = enumerateRecursively_step1PlusButNotLast;
        };
        pipeline[lastStepIndex] = enumerateRecursively_stepLastWithShortCircuitedPermCapture;

        return pipeline;
    }

    // enumeration for incomplete `House` is NOT short circuited in the last step.
    private static newEnumerationPipelineForIncompleteHouse(cageCount: number) {
        const pipeline = new Array<EnumerationStepFunction>(cageCount + 1);

        pipeline[0] = enumerateRecursively_step0;
        for (const step of CachedNumRanges.ONE_TO_N_LT_10[cageCount]) {
            pipeline[step] = enumerateRecursively_step1PlusButNotLast;
        };
        pipeline[cageCount] = enumerateRecursively_stepLastWithPermCaptureAndComboMark;

        return pipeline;
    }

    constructor(houseCagesAreaModel: HouseCagesAreaModel) {
        const cages = houseCagesAreaModel.cages;
        const cageCount = cages.length;

        this.combos = new Array(cageCount);
        this.allCageCombos = cages.map(cage => combosForSum(cage.sum, cage.cellCount));
        this.cageIndicesRange = CachedNumRanges.ZERO_TO_N_LT_81[cageCount];
        this.usedCombosHashes = this.cageIndicesRange.map(() => new Set());

        const isFullHouseCoverage = houseCagesAreaModel.cellCount === House.CELL_COUNT;
        if (isFullHouseCoverage) {
            this.enumerationPipeline = Context._CACHED_ENUMERATION_PIPELINES_FOR_COMPLETE_HOUSE[cageCount];
        } else {
            this.enumerationPipeline = Context._CACHED_ENUMERATION_PIPELINES_FOR_INCOMPLETE_HOUSE[cageCount];
        }

        this.usedCombos = new Array(cageCount);
    }

    /**
     * Collects combinations to {@link combos} which were marked as used during enumeration of permutations.
     */
    finalizeCombos() {
        for (const i of this.cageIndicesRange) {
            const sumCombos = this.allCageCombos[i];
            const actualSumCombosSet = this.usedCombosHashes[i];

            this.combos[i] = new Array(actualSumCombosSet.size);
            for (const combo of sumCombos.val) {
                if (actualSumCombosSet.has(combo.fastNumSet.binaryStorage)) {
                    this.combos[i].push(combo);
                }
            }
        };
    };
}
