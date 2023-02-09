import { ReadonlyCages } from '../../puzzle/cage';
import { House } from '../../puzzle/house';
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
     * It's up to the caller to provide valid input.
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

type IterationFunction = (ctx: Context, sumCombos: SumCombos, step: number) => void;
type IterationPipeline = ReadonlyArray<IterationFunction>;

const iterateRecursively_next = (ctx: Context, step: number) => {
    ctx.iterationPipeline[step](ctx, ctx.allCageCombos[step], step);
};

const _pushAndAdvanceIterationAndPop = (ctx: Context, combo: Combo, step: number) => {
    ctx.stack[step] = combo;

    ctx.usedNums.add(combo.fastNumSet);
    iterateRecursively_next(ctx, step + 1);
    ctx.usedNums.remove(combo.fastNumSet);
};

const iterateRecursively_index0 = (ctx: Context, sumCombos: SumCombos, step: number) => {
    for (const combo of sumCombos.val) {
        _pushAndAdvanceIterationAndPop(ctx, combo, step);
    }
};

const iterateRecursively_index1Plus = (ctx: Context, sumCombos: SumCombos, step: number) => {
    for (const combo of sumCombos.val) {
        if (ctx.usedNums.doesNotHaveAny(combo.fastNumSet)) {
            _pushAndAdvanceIterationAndPop(ctx, combo, step);
        }
    }
};

const iterateRecursively_indexLastWithPermCapture = (ctx: Context) => {
    ctx.perms.push([...ctx.stack]);
    ctx.cageIndicesRange.forEach(i => {
        ctx.usedCombosHashes[i].add(ctx.stack[i].fastNumSet.binaryStorage);
    });
};

const iterateRecursively_indexLastWithShortCircuitedPermCapture = (ctx: Context, sumCombos: SumCombos, step: number) => {
    const lastCombo = sumCombos.get(ctx.usedNums.remaining());
    if (lastCombo !== undefined) {
        ctx.stack[step] = lastCombo;
        iterateRecursively_indexLastWithPermCapture(ctx);
    }
};

class Context {
    readonly combos: Array<Array<Combo>>;
    readonly perms = new Array<ReadonlyCombos>();

    readonly allCageCombos: Array<SumCombos>;
    readonly cageIndicesRange: ReadonlyArray<number>;
    readonly usedCombosHashes = new Array<Set<BinaryStorage>>();
    readonly iterationPipeline: IterationPipeline;
    readonly stack: Array<Combo>;
    readonly usedNums = new FastNumSet();

    // caching iteration pipelines improves performance by around 5-10%
    private static _CACHED_ITERATION_PIPELINES_FOR_COMPLETE_HOUSE: ReadonlyArray<IterationPipeline> =
        Context.newIterationPipelines(House.CELL_COUNT + 1, Context.newIterationPipelineForCompleteHouse);
    private static _CACHED_ITERATION_PIPELINES_FOR_INCOMPLETE_HOUSE: ReadonlyArray<IterationPipeline> =
        Context.newIterationPipelines(House.CELL_COUNT, Context.newIterationPipelineForIncompleteHouse);

    private static newIterationPipelines(cellCount: number, newIterationPipelineFn: (cageCount: number) => IterationPipeline) {
        return CachedNumRanges.ZERO_TO_N_LT_81[cellCount].map(cageCount => {
            return cageCount < 2 ? [] : newIterationPipelineFn(cageCount);
        });
    }

    private static newIterationPipelineForCompleteHouse(cageCount: number) {
        const pipeline = new Array<IterationFunction>(cageCount);
        const lastStepIndex = cageCount - 1;

        pipeline[0] = iterateRecursively_index0;
        CachedNumRanges.ONE_TO_N_LT_10[lastStepIndex].forEach(step => {
            pipeline[step] = iterateRecursively_index1Plus;
        });
        pipeline[lastStepIndex] = iterateRecursively_indexLastWithShortCircuitedPermCapture;

        return pipeline;
    }

    private static newIterationPipelineForIncompleteHouse(cageCount: number) {
        const pipeline = new Array<IterationFunction>(cageCount + 1);

        pipeline[0] = iterateRecursively_index0;
        CachedNumRanges.ONE_TO_N_LT_10[cageCount].forEach(step => {
            pipeline[step] = iterateRecursively_index1Plus;
        });
        pipeline[cageCount] = iterateRecursively_indexLastWithPermCapture;

        return pipeline;
    }

    constructor(cages: ReadonlyCages) {
        const cageCount = cages.length;

        this.combos = new Array<Array<Combo>>(cageCount);
        this.allCageCombos = cages.map(cage => combosForSum(cage.sum, cage.cellCount));
        this.cageIndicesRange = CachedNumRanges.ZERO_TO_N_LT_81[cageCount];
        this.cageIndicesRange.forEach(i => {
            this.combos[i] = [];
            this.usedCombosHashes[i] = new Set<BinaryStorage>();
        });

        const isFullHouseCoverage = cages.reduce((partialCellCount, a) => partialCellCount + a.cellCount, 0) === House.CELL_COUNT;
        if (isFullHouseCoverage) {
            this.iterationPipeline = Context._CACHED_ITERATION_PIPELINES_FOR_COMPLETE_HOUSE[cageCount];
        } else {
            this.iterationPipeline = Context._CACHED_ITERATION_PIPELINES_FOR_INCOMPLETE_HOUSE[cageCount];
        }

        this.stack = new Array<Combo>(cageCount);
    }
}

class RecursiveEnumerator {
    private readonly ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    execute() {
        iterateRecursively_next(this.ctx, 0);

        this.ctx.cageIndicesRange.forEach(i => {
            const sumCombos = this.ctx.allCageCombos[i];
            const actualSumCombosSet = this.ctx.usedCombosHashes[i];

            for (const combo of sumCombos.val) {
                if (actualSumCombosSet.has(combo.fastNumSet.binaryStorage)) {
                    this.ctx.combos[i].push(combo);
                }
            }
        });

        return { combos: this.ctx.combos, perms: this.ctx.perms };
    }
}

type ComputeFn = (cages: ReadonlyCages) => NonOverlappingHouseCagesCombinatorics;

const EMPTY_INSTANCE = {
    combos: [],
    perms: []
};

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
    return new RecursiveEnumerator(new Context(cages)).execute();
};

const CAGE_COUNT_BASED_STRATEGIES: Array<ComputeFn> = [
    shortCircuitForNoCages, // for 0 Cages
    shortCircuitFor1Cage,   // for 1 Cage
    computeForSeveralCages, // for 2 Cages
    computeForSeveralCages, // for 3 Cages
    computeForSeveralCages, // for 4 Cages
    computeForSeveralCages, // for 5 Cages
    computeForSeveralCages, // for 6 Cages
    computeForSeveralCages, // for 7 Cages
    computeForSeveralCages, // for 8 Cages
    computeForSeveralCages, // for 9 Cages
];
