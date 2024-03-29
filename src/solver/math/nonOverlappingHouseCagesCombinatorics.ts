// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../puzzle/cell';
import { House } from '../../puzzle/house';
import { SudokuNumsSet } from '../sets';
import { CachedNumRanges } from '../../util/cachedNumRanges';
import { Combo, ReadonlyCombos } from './combo';
import { NonOverlappingCagesAreaModel } from '../models/elements/nonOverlappingCagesAreaModel';
import { Bits32 } from '../sets';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HouseCagesCombinatorics, HouseCagesCombos } from './houseCagesCombinatorics';
import { CombosSet } from '../sets';
import { SumCombinatorics } from '.';

/**
 * Single permutation of possible numbers in {@link House} {@link Cage}s
 * represented as a readonly array of {@link Combo}s.
 *
 * @public
 */
export type HouseCagesPerm = ReadonlyCombos;

/**
 * Readonly array of all possible {@link HouseCagesPerm}s for a {@link House}.
 *
 * @public
 */
export type HouseCagesPerms = ReadonlyArray<HouseCagesPerm>;

/**
 * Combinatorics of possible _non-overlapping_ {@link Cage}s' numbers within the same {@link House}.
 *
 * {@link Cage}s are considered _non-overlapping_ if they do *not* have the same {@link Cell}s.
 *
 * Implementation of this interface should follow Killer Sudoku constraint,
 * which states that _a {@link House} has nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * @public
 */
export interface NonOverlappingHouseCagesCombinatorics extends HouseCagesCombinatorics {

    /**
     * Possible {@link House} {@link Cell}s' number permutations in the form of {@link HouseCagesPerms}.
     *
     * Each value in this array is a single permutation of possible numbers in {@link House} {@link Cage}s
     * represented as {@link HouseCagesPerm}.
     *
     * Each {@link Combo} value in {@link HouseCagesPerm} appears in the same order as respective {@link Cage}s
     * in the `model` input of {@link enumerateCombosAndPerms} method,
     * meaning {@link Cage} of index `i` in the `model` input
     * will be mapped to the {@link Combo} of index `i` in each {@link HouseCagesPerm}.
     *
     * Numbers in each {@link HouseCagesPerm} are guaranteed to be nonrepeating following Killer Sudoku constraint of
     * _a {@link House} having nonrepeating set of {@link Cell}'s with numbers from 1 to 9.
     */
    readonly perms: HouseCagesPerms;

}

/**
 * Combinatorics of possible _non-overlapping_ {@link Cage}s' numbers within the same {@link House}.
 *
 * {@link Cage}s are considered _non-overlapping_ if they do *not* have the same {@link Cell}s.
 *
 * Implementation of this interface should follow Killer Sudoku constraint,
 * which states that _a {@link House} has nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * @public
 */
export class NonOverlappingHouseCagesCombinatorics {

    // istanbul ignore next
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Enumerates possible {@link Cell}s' numbers for the {@link Cage}s within the same {@link House}
     * in the form of {@link HouseCagesCombos} as well as
     * possible {@link House} {@link Cell}s' number permutations in the form of {@link HouseCagesPerms}
     * considering {@link Cage}s to be _non-overlapping_.
     *
     * @param model - {@link NonOverlappingCagesAreaModel}.
     *
     * {@link Cage}s may cover either complete set of {@link House} {@link Cell}s or a subset.
     * Empty {@link NonOverlappingCagesAreaModel} is also acceptable.
     *
     * For performance reasons, this method does *not* check:
     *  - if all given {@link Cage}s belong to the same {@link House};
     *  - if {@link Cell}s in the given {@link Cage}s are _non-overlapping_;
     *  - if total sum of all {@link Cage}s is no greater than {@link House} sum.
     * It's up to the caller to provide valid input.
     *
     * @returns Possible {@link Cell}s' numbers for the {@link Cage}s within the same {@link House}
     * in the form of {@link HouseCagesCombos} as well as
     * possible {@link House} {@link Cell}s' number permutations in the form of {@link HouseCagesPerms}
     * considering {@link Cage}s to be _non-overlapping_.
     *
     * @see combosSets
     * @see perms
     */
    static enumerateCombosAndPerms(model: NonOverlappingCagesAreaModel): NonOverlappingHouseCagesCombinatorics {
        return CAGE_COUNT_BASED_STRATEGIES[model.cages.length](model);
    }

};

/**
 * Computational strategy which encapsulates quickest possible way to do enumeration
 * according to the amount of {@link Cage}s.
 */
type ComputeStrategyFn = (model: NonOverlappingCagesAreaModel) => NonOverlappingHouseCagesCombinatorics;

const EMPTY_INSTANCE: NonOverlappingHouseCagesCombinatorics = {
    combosSets: [],
    perms: []
};

/**
 * In case there are NO {@link Cage}s in {@link NonOverlappingCagesAreaModel},
 * there is nothing to enumerate, so the same empty readonly array is returned.
 *
 * This technique avoids extra array object construction.
 */
const shortCircuitForNoCages: ComputeStrategyFn = () => {
    return EMPTY_INSTANCE;
};

/**
 * In case there is only 1 {@link Cage} in {@link NonOverlappingCagesAreaModel},
 * the full enumeration of {@link HouseCagesCombos} and {@link HouseCagesPerms} is *not* required.
 *
 * It is enough to enumerate only the {@link Combo}s for the one & only {@link Cage} sum and
 * trivially derive resulting {@link HouseCagesCombos} and {@link HouseCagesPerms}.
 *
 * This technique avoids {@link Context} construction which is relatively _heavy_.
 */
const shortCircuitFor1Cage: ComputeStrategyFn = (model) => {
    const singleCage = model.cages[0];
    const singleCageCombos = SumCombinatorics.BY_COUNT_BY_SUM[singleCage.cellCount][singleCage.sum];
    return {
        combosSets: singleCageCombos.combosSets,
        perms: singleCageCombos.perms
    };
};

/**
 * In case there are 2 or more {@link Cage}s in {@link NonOverlappingCagesAreaModel},
 * the full enumeration of {@link HouseCagesCombos} and {@link HouseCagesPerms} is executed.
 */
const enumerateStrategyForSeveralCages: ComputeStrategyFn = (model) => {
    return enumerateRecursively_main(new Context(model));
};

/**
 * All enumeration strategies which encapsulate quickest possible way to do enumeration
 * according to the amount of {@link Cage}s in {@link NonOverlappingCagesAreaModel}.
 */
const CAGE_COUNT_BASED_STRATEGIES: Array<ComputeStrategyFn> = [
    shortCircuitForNoCages,           // for 0 `Cage`s
    shortCircuitFor1Cage,             // for 1 `Cage`
    enumerateStrategyForSeveralCages, // for 2 `Cage`s
    enumerateStrategyForSeveralCages, // for 3 `Cage`s
    enumerateStrategyForSeveralCages, // for 4 `Cage`s
    enumerateStrategyForSeveralCages, // for 5 `Cage`s
    enumerateStrategyForSeveralCages, // for 6 `Cage`s
    enumerateStrategyForSeveralCages, // for 7 `Cage`s
    enumerateStrategyForSeveralCages, // for 8 `Cage`s
    enumerateStrategyForSeveralCages, // for 9 `Cage`s
];

/**
 * Entry point to the recursive enumeration which collects {@link HouseCagesCombos} and {@link HouseCagesPerms}.
 */
const enumerateRecursively_main = (ctx: Context): NonOverlappingHouseCagesCombinatorics => {
    // key work: recursive enumeration which collects `HouseCagesPerms` and efficiently marks used `Combo`s.
    enumerateRecursively_next(ctx, 0);

    // finalization: collecting `HouseCagesCombos` from marked `Combo`s.
    ctx.collectUsedCombos();

    return { combosSets: ctx.combosSets, perms: ctx.perms };
};

/**
 * Entry point to a particular step of recursive enumeration which leverages cached enumeration pipeline.
 */
const enumerateRecursively_next = (ctx: Context, step: number) => {
    ctx.enumerationPipeline[step](ctx, step, ctx.allCagesSumCombinatorics[step]);
};

/**
 * Supplementary function which executes next enumeration step
 * with updating the {@link Context}:
 *
 *  - currently used {@link Combo}s are updated with the current {@link Combo} before next enumeration step;
 *  - currently used numbers are updated with the current {@link Combo} numbers before next enumeration step
 *  and reverted upon the recursive completion of next enumeration step.
 */
const _pushAndAdvanceEnumerationAndPop = (ctx: Context, combo: Combo, step: number) => {
    ctx.usedCombos[step] = combo;

    ctx.usedNums.addAll(combo.numsSet);
    enumerateRecursively_next(ctx, step + 1);
    ctx.usedNums.deleteAll(combo.numsSet);
};

/**
 * Generic enumeration step function.
 */
type EnumerationStepFunction = (ctx: Context, step: number, combinatorics: SumCombinatorics) => void;

/**
 * In case enumeration is in the first step, the algorithm is trivial:
 *
 *  - pick each {@link Combo} in the first {@link Cage};
 *  - let enumeration proceed with each {@link Combo} further;
 */
const enumerateRecursively_step0 = (ctx: Context, step: number, combinatorics: SumCombinatorics) => {
    for (const combo of combinatorics.val) {
        _pushAndAdvanceEnumerationAndPop(ctx, combo, step);
    }
};

/**
 * In case enumeration is in the second (and further) and non last step, the algorithm is just like for the first step
 * with extra check that next {@link Combo} does *not* overlap with currently used numbers.
 *
 * This logic is *not* unified with the first step on purpose for performance reasons:
 * checking overlap with currently used numbers is *not* needed at all in the first step.
 */
const enumerateRecursively_step1PlusButNotLast = (ctx: Context, step: number, combinatorics: SumCombinatorics) => {
    for (const combo of combinatorics.val) {
        if (ctx.usedNums.doesNotHaveAny(combo.numsSet)) {
            _pushAndAdvanceEnumerationAndPop(ctx, combo, step);
        }
    }
};

/**
 * In case enumeration is in the last step, it means next {@link HouseCagesPerm} is found.
 * (since overlapping {@link Combo}s were skipped, non-overlapping {@link Combo}s were found).
 *
 * {@link HouseCagesPerm} is captured and respective {@link Combo}s are marked as used.
 */
const enumerateRecursively_stepLastWithPermCaptureAndComboMark = (ctx: Context) => {
    ctx.perms.push([...ctx.usedCombos]);
    for (const i of ctx.cageIndicesRange) {
        ctx.usedCombosHashes[i].add(ctx.usedCombos[i].numsBits);
    };
};

/**
 * In case enumeration is in the last step, and the enumeration is executed for the whole {@link House},
 * it is possible to short circuit check of the last {@link Combo} according to the numbers *not* yet in use.
 * (since {@link House} must contain all numbers from 1 to 9).
 *
 * If the check passes, {@link enumerateRecursively_stepLastWithPermCaptureAndComboMark} is run.
 */
const enumerateRecursively_stepLastWithShortCircuitedPermCapture = (ctx: Context, step: number) => {
    const lastCombo = Combo.BY_NUMS_BITS[ctx.usedNums.remaining.bits];
    if (lastCombo !== undefined) {
        ctx.usedCombos[step] = lastCombo;
        enumerateRecursively_stepLastWithPermCaptureAndComboMark(ctx);
    }
};

/**
 * Pipeline of enumeration functions that are sorted according to the steps to be executed in recursion.
 */
type EnumerationPipeline = ReadonlyArray<EnumerationStepFunction>;

/**
 * Data context for full enumeration of {@link HouseCagesCombos} and {@link HouseCagesPerms}.
 */
class Context implements NonOverlappingHouseCagesCombinatorics {

    readonly combosSets: Array<CombosSet>;
    readonly perms = new Array<ReadonlyCombos>();

    readonly allCagesSumCombinatorics: Array<SumCombinatorics>;
    readonly cageIndicesRange: ReadonlyArray<number>;
    readonly usedCombosHashes: Array<Set<Bits32>>;
    readonly enumerationPipeline: EnumerationPipeline;
    readonly usedCombos: Array<Combo>;
    readonly usedNums = SudokuNumsSet.newEmpty();

    // caching enumeration pipelines improves performance by around 5-10%
    private static _CACHED_ENUMERATION_PIPELINES_FOR_COMPLETE_HOUSE: ReadonlyArray<EnumerationPipeline> =
        Context.newEnumerationPipelines(House.CELL_COUNT_RANGE_INCSLUSIVE_UPPER_BOUND, Context.newEnumerationPipelineForCompleteHouse);
    private static _CACHED_ENUMERATION_PIPELINES_FOR_INCOMPLETE_HOUSE: ReadonlyArray<EnumerationPipeline> =
        Context.newEnumerationPipelines(House.CELL_COUNT, Context.newEnumerationPipelineForIncompleteHouse);

    private static newEnumerationPipelines(cellCount: number, newEnumerationPipelineFn: (cageCount: number) => EnumerationPipeline) {
        return CachedNumRanges.ZERO_TO_N_LTE_81[cellCount].map(cageCount => {
            return cageCount < 2 ? [] : newEnumerationPipelineFn(cageCount);
        });
    }

    // enumeration for complete `House` is short circuited in the last step.
    private static newEnumerationPipelineForCompleteHouse(cageCount: number) {
        const pipeline = new Array<EnumerationStepFunction>(cageCount);
        const lastStepIndex = cageCount - 1;

        pipeline[0] = enumerateRecursively_step0;
        for (const step of CachedNumRanges.ONE_TO_N_LTE_10[lastStepIndex]) {
            pipeline[step] = enumerateRecursively_step1PlusButNotLast;
        };
        pipeline[lastStepIndex] = enumerateRecursively_stepLastWithShortCircuitedPermCapture;

        return pipeline;
    }

    // enumeration for incomplete `House` is *not* short circuited in the last step.
    private static newEnumerationPipelineForIncompleteHouse(cageCount: number) {
        const pipeline = new Array<EnumerationStepFunction>(cageCount + 1);

        pipeline[0] = enumerateRecursively_step0;
        for (const step of CachedNumRanges.ONE_TO_N_LTE_10[cageCount]) {
            pipeline[step] = enumerateRecursively_step1PlusButNotLast;
        };
        pipeline[cageCount] = enumerateRecursively_stepLastWithPermCaptureAndComboMark;

        return pipeline;
    }

    constructor(model: NonOverlappingCagesAreaModel) {
        const cages = model.cages;
        const cageCount = cages.length;

        this.combosSets = new Array(cageCount);
        this.allCagesSumCombinatorics = cages.map(cage => SumCombinatorics.BY_COUNT_BY_SUM[cage.cellCount][cage.sum]);
        this.cageIndicesRange = CachedNumRanges.ZERO_TO_N_LTE_81[cageCount];
        this.usedCombosHashes = this.cageIndicesRange.map(() => new Set());

        const isFullHouseCoverage = model.cellCount === House.CELL_COUNT;
        if (isFullHouseCoverage) {
            this.enumerationPipeline = Context._CACHED_ENUMERATION_PIPELINES_FOR_COMPLETE_HOUSE[cageCount];
        } else {
            this.enumerationPipeline = Context._CACHED_ENUMERATION_PIPELINES_FOR_INCOMPLETE_HOUSE[cageCount];
        }

        this.usedCombos = new Array(cageCount);
    }

    /**
     * Collects {@link HouseCagesCombos} into {@link combosSets}.
     *
     * {@link Combo}s collected are the ones which were marked as _used_
     * during enumeration of {@link HouseCagesPerms}.
     */
    collectUsedCombos() {
        for (const cageIndex of this.cageIndicesRange) {
            const sumCombinatorics = this.allCagesSumCombinatorics[cageIndex];
            const actualSumCombosSet = this.usedCombosHashes[cageIndex];

            this.combosSets[cageIndex] = CombosSet.newEmpty(sumCombinatorics);
            for (const combo of sumCombinatorics.val) {
                if (actualSumCombosSet.has(combo.numsBits)) {
                    this.combosSets[cageIndex].addCombo(combo);
                }
            }
        }
    };

}
