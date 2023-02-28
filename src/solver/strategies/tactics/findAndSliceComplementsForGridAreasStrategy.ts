import { Cage } from '../../../puzzle/cage';
import { GridSizeAndCellPositionsIteration } from '../../../puzzle/gridSizeAndCellPositionsIteration';
import { House, HouseIndex } from '../../../puzzle/house';
import { Nonet } from '../../../puzzle/nonet';
import { CellIndicesCheckingSet, ReadonlyCellIndicesCheckingSet } from '../../math';
import { CachedNumRanges } from '../../math/cachedNumRanges';
import { CageModel } from '../../models/elements/cageModel';
import { GridAreaModel } from '../../models/elements/gridAreaModel';
import { HouseModel } from '../../models/elements/houseModel';
import { MasterModel, MasterModelEvents } from '../../models/masterModel';
import { Context } from '../context';
import { Strategy } from '../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';

/**
 * Configuration options for {@link FindAndSliceComplementsForGridAreasStrategy}.
 *
 * Can be used both for tuning production execution as well as tailored testing scenarios.
 */
export type Config = {

    /**
     * Whether to apply the strategy to {@link Row} areas,
     * both individual {@link Row}s and adjacent {@link Row}s.
     *
     * Size of adjacent {@link Row} areas can be additionally configured by
     * {@link minAdjacentRowsAndColumnsAreas} and {@link maxAdjacentRowsAndColumnsAreas}.
     *
     * Default is `true`.
     */
    readonly isApplyToRowAreas: boolean;

    /**
     * Whether to apply the strategy to {@link Column} areas,
     * both individual {@link Column}s and adjacent {@link Column}s.
     *
     * Size of adjacent {@link Column} areas can be additionally configured by
     * {@link minAdjacentRowsAndColumnsAreas} and {@link maxAdjacentRowsAndColumnsAreas}.
     *
     * Default is `true`.
     */
    readonly isApplyToColumnAreas: boolean;

    /**
     * Whether to apply the strategy to {@link Nonet}s.
     *
     * Only individual {@link Nonet} are analyzed, NOT adjacent {@link Nonet}s.
     *
     * Default is `true`.
     */
    readonly isApplyToNonetAreas: boolean;

    /**
     * Minimum amount of adjacent {@link Row} and {@link Column} areas
     * to apply the strategy to.
     *
     * Should be in the range of [1, 8].
     * Upper bound in this range is NOT 9
     * since applying it to the whole {@link Grid} will NOT produce any hint.
     *
     * This configuration is relevant only when {@link isApplyToRowAreas} or {@link isApplyToColumnAreas}
     * is set to `true`.
     *
     * Default is `1`, which means _apply to all individual {@link Row}s and {@link Column}s at least_.
     */
    readonly minAdjacentRowsAndColumnsAreas: number;

    /**
     * Maximum amount of adjacent {@link Row} and {@link Column} areas
     * to apply the strategy to.
     *
     * Should be in the range of [1, 8].
     * Upper bound in this range is NOT 9
     * since applying it to the whole {@link Grid} will NOT produce any hint.
     *
     * This configuration is relevant only when {@link isApplyToRowAreas} or {@link isApplyToColumnAreas}
     * is set to `true`.
     *
     * Default is `4`.
     */
    readonly maxAdjacentRowsAndColumnsAreas: number;

    /**
     * Maximum amount of {@link Cell}s in a complement {@link Cage}
     * to consider such a {@link Cage} as _meaningful_.
     *
     * The smaller the {@link Cage} the more hints it leads to.
     * As a result, there is limited sense in finding bigger {@link Cage}s
     * as it requires more execution power and memory with less produced hints
     * UNLESS determining all possible hints is critical.
     *
     * Should be in the range of [1, 9].
     *
     * Default is `5` which covers between 80% and 90% of all {@link Cage} complement cases.
     */
    readonly maxMeaningfulComplementCageSize: number;

    /**
     * Whether to collect statistics about found complement {@link Cage}s.
     *
     * Useful for finding distribution of cases and understanding real-world usage
     * so that this {@link Config} can be tweaked further.
     *
     * Default is `false`.
     */
    readonly isCollectStats: boolean;

}

/**
 * Default {@link Config} options.
 *
 * When changing these defaults TSDoc for {@link Config} should be updated as well.
 */
const DEFAULT_CONFIG: Config = Object.freeze({
    isApplyToRowAreas: true,
    isApplyToColumnAreas: true,
    isApplyToNonetAreas: true,
    minAdjacentRowsAndColumnsAreas: 1,
    maxAdjacentRowsAndColumnsAreas: 4,
    maxMeaningfulComplementCageSize: 5,
    isCollectStats: false
});

class AreaStats {

    private readonly n: number;
    private readonly foundCagesByCellCount: Array<number>;
    private _totalCagesFound = 0;

    constructor(n: number) {
        this.n = n;
        this.foundCagesByCellCount = new Array(House.CELL_COUNT + 1).fill(0);
    }

    get totalCagesFound() {
        return this._totalCagesFound;
    }

    addFinding(cageCellCount: number) {
        this.foundCagesByCellCount[cageCellCount]++;
        this._totalCagesFound++;
    }

}

class Stats {

    private readonly _data: Array<AreaStats>;
    private _totalCagesFound = 0;

    constructor() {
        this._data = new Array(House.COUNT_OF_ONE_TYPE_PER_GRID);
        this.clear();
    }

    get data(): ReadonlyArray<AreaStats> {
        return this._data;
    }

    get totalCagesFound() {
        return this._totalCagesFound;
    }

    addFinding(n: number, cageCellCount: number) {
        this._data[n].addFinding(cageCellCount);
        this._totalCagesFound++;
    }

    clear() {
        for (const n of CachedNumRanges.ONE_TO_N_LTE_10[House.COUNT_OF_ONE_TYPE_PER_GRID]) {
            this._data[n] = new AreaStats(n);
        }
        this._totalCagesFound = 0;
    }

}

class ExecContext {
    readonly rowIndexedCages: Array<Set<CageModel>>;
    readonly columnIndexedCages: Array<Set<CageModel>>;

    constructor(model: MasterModel) {
        this.rowIndexedCages = new Array(House.CELL_COUNT);
        this.columnIndexedCages = new Array(House.CELL_COUNT);
        for (const i of CachedNumRanges.ZERO_TO_N_LTE_81[House.CELL_COUNT]) {
            this.rowIndexedCages[i] = new Set();
            this.columnIndexedCages[i] = new Set();
        }
        for (const cageM of model.cageModelsMap.values()) {
            this.rowIndexedCages[cageM.minRow].add(cageM);
            this.columnIndexedCages[cageM.minCol].add(cageM);
        }
    }

    readonly cageRegisteredEventHandler = (cageM: CageModel) => {
        this.rowIndexedCages[cageM.minRow].add(cageM);
        this.columnIndexedCages[cageM.minCol].add(cageM);
    };
    readonly cageUnregisteredEventHandler = (cageM: CageModel) => {
        this.rowIndexedCages[cageM.minRow].delete(cageM);
        this.columnIndexedCages[cageM.minCol].delete(cageM);
    };
};

/**
 * {@link Strategy} for solving Killer Sudoku puzzle
 * which finds _complement_ {@link Cage}s for {@link Row}, {@link Column} and {@link Nonet} areas
 * and registers them in the {@link MasterModel}.
 *
 * This {@link Strategy} produces hints which help to narrow down possibe number options
 * for the {@link Cell}s on the {@link Grid}.
 *
 * _Complement_ {@link Cage} is a {@link Cage} that completes {@link Row}, {@link Column} or {@link Nonet} area
 * along with already present {@link Cage}s so that such area is fully covered with {@link Cell}s.
 *
 * For example, let us consider a single {@link Row} with index `1` (second {@link Row} in the {@link Grid})
 * with the following {@link Cell}s:
 * ```
 * // (row, column)
 * (1, 0), (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8)
 * ```
 *
 * Let us assume this {@link Row} have the following {@link Cage}s already registered:
 * ```
 * Cage 1. Sum: 14. Cells: (1, 0), (1, 1)
 * Cage 2. Sum: 10. Cells: (1, 3), (1, 4), (1, 5)
 * Cage 3. Sum: 5.  Cells: (1, 7), (1, 8)
 * ```
 *
 * It can be observed, that these {@link Cage}s occupy the following {@link Cell}s in the {@link Row} area:
 * ```
 * (1, 0), (1, 1), (1, 3), (1, 4), (1, 5), (1, 7), (1, 8)
 * ```
 *
 * The following {@link Cell}s are NOT occupied by any {@link Cage} in this area:
 * ```
 * (1, 2), (1, 6)
 * ```
 * These 2 {@link Cell}s describe a _complement_ to existing {@link Cage}s
 * and it is trivial to derive its sum given that sum of all {@link Cell}s in a {@link House} is `45`:
 * ```
 * Complement Cage. Sum: 16 (calculated as 45 - 14 - 10 - 5 = 16). Cells: (1, 2), (1, 6)
 * ```
 *
 * Such a complement {@link Cage} reduces possible numbers for its {@link Cell}s,
 * which, in this case, limits possible numbers to `7` and `9` for {@link Cell}s at `(1, 2)` and `(1, 6)`
 * (the only unique Sudoku numbers that add up to `16`).
 * And, as a by-product of this hint, possible number options for `Cage 2` with sum `10`
 * which occupy {@link Cell}s `(1, 3)`, `(1, 4)`, `(1, 5)` are also reduced:
 * combination of numbers `1`, `2` and `7` is NOT relevant since it overlaps with `7`
 * residing in the complement {@link Cage} (only unique numbers are allowed in the {@link House}).
 * This way, more and more hints can be derived recursively by applying this and other strategies.
 *
 * Same approach is applied NOT only to {@link Row}s, but also to {@link Column}s and {@link Nonet}s.
 *
 * Also, this strategy applies complement determination to the areas of
 * adjacent {@link Row}s and {@link Column}s in addition to individual {@link Row}s and {@link Column}s.
 *
 * For example, adjacent area of two {@link Column}s with indices 3 and 4
 * applies the technique to the {@link Cage}s in the following {@link Cell}s:
 * ```
 * // (row, column)
 * (0, 3), (0, 4),
 * (1, 3), (1, 4),
 * (2, 3), (2, 4),
 * (3, 3), (3, 4),
 * (4, 3), (4, 4),
 * (5, 3), (5, 4),
 * (6, 3), (6, 4),
 * (7, 3), (7, 4),
 * (8, 3), (8, 4)
 * ```
 *
 * Non-adjacent areas are NOT analyzed because such an analysis will produce no valuable hints.
 *
 * This strategy is an _initialization_ strategy meaning it is applied just once on the particular {@link Puzzle}.
 *
 * The way this strategy works can by configured by {@link Config} options.
 *
 * @see {Config}
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Complements
 */
export class FindAndSliceComplementsForGridAreasStrategy extends Strategy {

    private readonly _config: Config;

    static readonly STATS = new Stats();

    /**
     * Constructs new {@link Strategy} with the given solving {@link Context}
     * and {@link Config} options.
     *
     * @param context - Solving {@link Context}.
     * @param config - {@link Config} options to apply on top of the defaults.
     *
     * @see {Strategy.constructor}
     */
    constructor(context: Context, config: Partial<Config> = DEFAULT_CONFIG) {
        super(context);
        this._config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * @see {Strategy.execute}
     */
    execute() {
        this.withEventHandlers();
    }

    private withEventHandlers() {
        const ctx = new ExecContext(this._model);
        try {
            this._model.addEventHandler(MasterModelEvents.CAGE_REGISTERED, ctx.cageRegisteredEventHandler);
            this._model.addEventHandler(MasterModelEvents.CAGE_UNREGISTERED, ctx.cageUnregisteredEventHandler);
            this.main(ctx);
        } finally {
            this._model.removeEventHandler(MasterModelEvents.CAGE_REGISTERED, ctx.cageRegisteredEventHandler);
            this._model.removeEventHandler(MasterModelEvents.CAGE_UNREGISTERED, ctx.cageUnregisteredEventHandler);
        }
    }

    private main(ctx: ExecContext) {
        if (this._config.isApplyToRowAreas) {
            this.applyToAreasOfSingleType(
                ctx.rowIndexedCages,
                (index: HouseIndex) => this._model.rowModels[index],
                FindAndSliceComplementsForGridAreasStrategy.isRowWithinArea_upperBoundartCheckOnly,
                FindAndSliceComplementsForGridAreasStrategy.rowIndices,
                this._config.minAdjacentRowsAndColumnsAreas,
                this._config.maxAdjacentRowsAndColumnsAreas
            );
        }
        if (this._config.isApplyToColumnAreas) {
            this.applyToAreasOfSingleType(
                ctx.columnIndexedCages,
                (index: HouseIndex) => this._model.columnModels[index],
                FindAndSliceComplementsForGridAreasStrategy.isColumnWithinArea_upperBoundartCheckOnly,
                FindAndSliceComplementsForGridAreasStrategy.columnIndices,
                this._config.minAdjacentRowsAndColumnsAreas,
                this._config.maxAdjacentRowsAndColumnsAreas
            );
        }
        if (this._config.isApplyToNonetAreas) {
            this.applyToAreasOfSingleType(
                ctx.columnIndexedCages, // not used
                (index: HouseIndex) => this._model.nonetModels[index],
                FindAndSliceComplementsForGridAreasStrategy.isColumnWithinArea_upperBoundartCheckOnly, // not used
                FindAndSliceComplementsForGridAreasStrategy.nonetIndices,
                1,
                1
            );
        }
    }

    private static isRowWithinArea_upperBoundartCheckOnly(cageM: CageModel, bottomOrRightIndexExclusive: number) {
        return cageM.maxRow < bottomOrRightIndexExclusive;
    }

    private static isColumnWithinArea_upperBoundartCheckOnly(cageM: CageModel, bottomOrRightIndexExclusive: number) {
        return cageM.maxCol < bottomOrRightIndexExclusive;
    }

    private static rowIndices(row: HouseIndex) {
        return FindAndSliceComplementsForGridAreasStrategy.ROW_CELL_INDICES_OF[row];
    }

    private static columnIndices(row: HouseIndex) {
        return FindAndSliceComplementsForGridAreasStrategy.COLUMN_CELL_INDICES_OF[row];
    }

    private static nonetIndices(row: HouseIndex) {
        return FindAndSliceComplementsForGridAreasStrategy.NONET_CELL_INDICES_OF[row];
    }

    private static ROW_CELL_INDICES_OF: ReadonlyArray<ReadonlyCellIndicesCheckingSet> = (() => {
        const val = new Array<CellIndicesCheckingSet>(House.COUNT_OF_ONE_TYPE_PER_GRID);
        for (const row of CachedNumRanges.ZERO_TO_N_LTE_81[House.COUNT_OF_ONE_TYPE_PER_GRID]) {
            const indices = CellIndicesCheckingSet.newEmpty();
            for (const col of CachedNumRanges.ZERO_TO_N_LTE_81[GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT]) {
                indices.add(CellIndicesCheckingSet.of(Math.imul(row, GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT) + col));
            }
            val[row] = indices;
        }
        return val;
    })();

    private static COLUMN_CELL_INDICES_OF: ReadonlyArray<ReadonlyCellIndicesCheckingSet> = (() => {
        const val = new Array<CellIndicesCheckingSet>(House.COUNT_OF_ONE_TYPE_PER_GRID);
        for (const col of CachedNumRanges.ZERO_TO_N_LTE_81[House.COUNT_OF_ONE_TYPE_PER_GRID]) {
            const indices = CellIndicesCheckingSet.newEmpty();
            for (const row of CachedNumRanges.ZERO_TO_N_LTE_81[GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT]) {
                indices.add(CellIndicesCheckingSet.of(Math.imul(row, GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT) + col));
            }
            val[col] = indices;
        }
        return val;
    })();

    private static NONET_CELL_INDICES_OF: ReadonlyArray<ReadonlyCellIndicesCheckingSet> = (() => {
        const val = new Array<CellIndicesCheckingSet>(House.COUNT_OF_ONE_TYPE_PER_GRID);
        for (const col of CachedNumRanges.ZERO_TO_N_LTE_81[House.COUNT_OF_ONE_TYPE_PER_GRID]) {
            val[col] = CellIndicesCheckingSet.newEmpty();
        }

        GridSizeAndCellPositionsIteration.forEachCellPositionOnTheGrid(cellRowAndColumn => {
            const row = cellRowAndColumn[0];
            const col = cellRowAndColumn[1];
            const nonet = Nonet.GRID_CELLS_TO_NONETS[row][col];
            val[nonet].add(CellIndicesCheckingSet.of(Math.imul(row, GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT) + col));
        });

        return val;
    })();

    private applyToAreasOfSingleType(
            indexedCages: ReadonlyArray<Set<CageModel>>,
            singleHouseCageModelsFn: (index: number) => HouseModel,
            isWithinAreaFn: (cageM: CageModel, bottomOrRightIndexExclusive: number) => boolean,
            cellAreaIndicesFn: (index: number) => ReadonlyCellIndicesCheckingSet,
            minAdjacentAreas: number,
            maxAdjacentAreas: number) {
        if (minAdjacentAreas <= 1 && maxAdjacentAreas >= 1) {
            for (const index of CachedNumRanges.ZERO_TO_N_LTE_81[House.COUNT_OF_ONE_TYPE_PER_GRID]) {
                this.doFindAndSliceComplementsForAdjacentGridAreas(
                    singleHouseCageModelsFn(index).cageModels,
                    1,
                    cellAreaIndicesFn(index)
                );
            }
        }

        let n = Math.max(minAdjacentAreas, 2);
        while (n <= maxAdjacentAreas) {
            const upperBound = House.CELL_COUNT - n;
            let topOrLeftIndex = 0;
            do {
                const rightOrBottomExclusive = topOrLeftIndex + n;
                const cageMs = new Array<CageModel>();
                const indices = CellIndicesCheckingSet.newEmpty();
                let index = topOrLeftIndex;
                do {
                    for (const cageM of indexedCages[index]) {
                        if (isWithinAreaFn(cageM, rightOrBottomExclusive)) {
                            cageMs.push(cageM);
                        }
                    }
                    indices.add(cellAreaIndicesFn(index));
                    index++;
                } while (index < rightOrBottomExclusive);

                this.doFindAndSliceComplementsForAdjacentGridAreas(cageMs, n, indices);
                topOrLeftIndex++;
            } while (topOrLeftIndex <= upperBound);
            n++;
        }
    }

    private doFindAndSliceComplementsForAdjacentGridAreas(
            cageMs: ReadonlyArray<CageModel>,
            n: number,
            areaCellIndices: ReadonlyCellIndicesCheckingSet) {
        const nHouseCellCount = Math.imul(n, House.CELL_COUNT);
        const nHouseSum = Math.imul(n, House.SUM);

        const cagesAreaModel = GridAreaModel.fromCageModels(cageMs, n);
        const sum = nHouseSum - cagesAreaModel.nonOverlappingCagesAreaModel.sum;
        if ((n === 1 || cagesAreaModel.nonOverlappingCagesAreaModel.cellCount >= nHouseCellCount - this._config.maxMeaningfulComplementCageSize) && sum) {
            const residualCageBuilder = Cage.ofSum(sum);
            const complementIndices = areaCellIndices.and(cagesAreaModel.nonOverlappingCagesAreaModel.cellIndices.not());
            residualCageBuilder.withCells(complementIndices.cells());
            if (residualCageBuilder.cellCount == 1) {
                const cellM = this._context.model.cellModelOf(residualCageBuilder.cells[0]);
                cellM.placedNum = residualCageBuilder.new().sum;
                this._context.recentlySolvedCellModels = [ cellM ];
                this.executeAnother(ReduceCageNumOptsBySolvedCellsStrategy);
            }
            residualCageBuilder.setIsInput(this._model.isDerivedFromInputCage(residualCageBuilder.cells));

            this._context.cageSlicer.addAndSliceResidualCageRecursively(residualCageBuilder.new());

            if (this._config.isCollectStats) {
                FindAndSliceComplementsForGridAreasStrategy.STATS.addFinding(n, residualCageBuilder.cellCount);
            }
        }
    }
}
