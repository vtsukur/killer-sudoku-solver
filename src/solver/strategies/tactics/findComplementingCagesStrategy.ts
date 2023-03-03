import { Cage } from '../../../puzzle/cage';
import { CellsIterator } from '../../../puzzle/cellsIterator';
import { Column } from '../../../puzzle/column';
import { House, HouseIndex } from '../../../puzzle/house';
import { Nonet } from '../../../puzzle/nonet';
import { Row } from '../../../puzzle/row';
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
 * Configuration options for {@link FindComplementingCagesStrategy}.
 *
 * Can be used for both tuning production execution as well as tailoring testing scenarios.
 */
export type Config = {

    /**
     * Whether to apply the strategy to individual {@link Row}s
     * and adjacent {@link Row} areas.
     *
     * Size of adjacent {@link Row} areas can be configured by
     * {@link minAdjacentRowsAndColumnsAreas} and {@link maxAdjacentRowsAndColumnsAreas}.
     *
     * Default value is `true`, which means enabling the strategy
     * to {@link Row}s and adjacent {@link Row} areas.
     */
    readonly isApplyToRowAreas: boolean;

    /**
     * Whether to apply the strategy to individual {@link Column}s
     * and adjacent {@link Column} areas.
     *
     * Size of adjacent {@link Column} areas can be configured by
     * {@link minAdjacentRowsAndColumnsAreas} and {@link maxAdjacentRowsAndColumnsAreas}.
     *
     * Default value is `true`, which means enabling the strategy
     * to {@link Column}s and adjacent {@link Column} areas.
     */
    readonly isApplyToColumnAreas: boolean;

    /**
     * Whether to apply the strategy to {@link Nonet}s.
     *
     * Only individual {@link Nonet} are analyzed, NOT adjacent {@link Nonet}s.
     *
     * Default value is `true`, which means enabling the strategy to {@link Nonet}s.
     */
    readonly isApplyToNonetAreas: boolean;

    /**
     * Minimum amount of adjacent {@link Row} and {@link Column} areas
     * to apply the strategy to.
     *
     * Should be in the range of `[1, 8]`.
     * Upper bound in this range excludes value `9`
     * since applying it to the whole {@link Grid} will NOT produce any hint.
     *
     * This configuration is relevant only when {@link isApplyToRowAreas} or {@link isApplyToColumnAreas}
     * is set to `true`.
     *
     * Default value is `1`, which means enabling the strategy
     * at least to all individual {@link Row}s and {@link Column}s.
     */
    readonly minAdjacentRowsAndColumnsAreas: number;

    /**
     * Maximum amount of adjacent {@link Row} and {@link Column} areas
     * to apply the strategy to.
     *
     * Should be in the range of `[1, 8]`.
     * Upper bound in this range excludes value `9`
     * since applying it to the whole {@link Grid} will NOT produce any hint.
     *
     * This configuration is relevant only when {@link isApplyToRowAreas} or {@link isApplyToColumnAreas}
     * is set to `true`.
     *
     * Default value is `4`, which covers more than 90% of all
     * possible {@link Cage} complements.
     */
    readonly maxAdjacentRowsAndColumnsAreas: number;

    /**
     * Maximum amount of {@link Cell}s in a complementing {@link Cage}
     * to consider such a {@link Cage} as successful search result.
     *
     * The smaller the {@link Cage} the more hints it leads to.
     * As a result, there is a limited sense of finding bigger {@link Cage}s
     * as it requires more execution power and memory with less amount produced hints
     * UNLESS determining all possible hints is critical.
     *
     * Should be in the range of `[1, 9]`.
     *
     * Default value is `5`, which covers between 80% and 90% of all
     * possible {@link Cage} complements.
     */
    readonly maxMeaningfulComplementSize: number;

    /**
     * Whether to collect statistics about found complementing {@link Cage}s.
     *
     * Useful for finding the distribution of cases and understanding real-world usage
     * so that this {@link Config} can be tweaked further.
     *
     * Default value is `false`, which disables the collection of statistics.
     */
    readonly isCollectStats: boolean;

}

/**
 * Default {@link Config} options.
 *
 * When changing these defaults, TSDoc for {@link Config} should be updated as well.
 */
const DEFAULT_CONFIG: Config = Object.freeze({
    isApplyToRowAreas: true,
    isApplyToColumnAreas: true,
    isApplyToNonetAreas: true,
    minAdjacentRowsAndColumnsAreas: 1,
    maxAdjacentRowsAndColumnsAreas: 4,
    maxMeaningfulComplementSize: 5,
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

class IndexedCageModelsTracker {
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
 * {@link Strategy} for solving the Killer Sudoku puzzle
 * which finds _complementing_ {@link Cage}s for {@link Row}, {@link Column} and {@link Nonet} areas
 * and registers them in the {@link MasterModel}.
 *
 * This {@link Strategy} produces hints which help to narrow down the possible numbers
 * for the {@link Cell}s on the {@link Grid}.
 *
 * _Complementing_ {@link Cage} is a {@link Cage} that completes {@link Row}, {@link Column} or {@link Nonet} area
 * along with already present {@link Cage}s so that such area is fully covered with {@link Cell}s.
 *
 * For example, let us consider a single {@link Row} of index `1` (second {@link Row} in the {@link Grid})
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
 * Complementing Cage. Sum: 16 (calculated as 45 - 14 - 10 - 5 = 16). Cells: (1, 2), (1, 6)
 * ```
 *
 * Such a complementing {@link Cage} reduces possible numbers for its {@link Cell}s,
 * which, in this case, limits possible numbers to `7` and `9` for {@link Cell}s at `(1, 2)` and `(1, 6)`
 * (unique Sudoku numbers that add up to `16`).
 * And, as a by-product of this hint, possible number options for `Cage 2` with sum `10`
 * which occupy {@link Cell}s `(1, 3)`, `(1, 4)`, `(1, 5)` are also reduced:
 * combination of numbers `1`, `2` and `7` is NOT relevant since it overlaps with `7`
 * residing in the complementing {@link Cage} (only unique numbers are allowed in the {@link House}).
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
 * {@link Nonet}s are analyzed only individually meaning
 * adjacent {@link Nonet} areas are NOT taken into account.
 *
 * This strategy is an _initialization_ strategy,
 * so it is applied just once on the particular {@link Puzzle}.
 *
 * The way this strategy works can be configured by {@link Config} options.
 *
 * @see {Config}
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Complements
 */
export class FindComplementingCagesStrategy extends Strategy {

    private readonly _config: Config;

    private readonly _rowAreasProcessor: RowAreasProcessor;
    private readonly _columnAreasProcessor: ColumnAreasProcessor;
    private readonly _nonetAreasProcessor: NonetAreasProcessor;

    static readonly STATS = new Stats();

    /**
     * Constructs new {@link Strategy} with the given solution {@link Context}
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

        const processorCtx: ConstantProcessorContext = {
            context,
            model: this._model,
            config: this._config,
            strategy: this
        };
        this._rowAreasProcessor = new RowAreasProcessor(processorCtx);
        this._columnAreasProcessor = new ColumnAreasProcessor(processorCtx);
        this._nonetAreasProcessor = new NonetAreasProcessor(processorCtx);
    }

    /**
     * @see {Strategy.execute}
     */
    execute() {
        const indexedCageMsTracker = new IndexedCageModelsTracker(this._model);
        try {
            //
            // Add event handlers to listen to `Cage` registration and unregistration
            // when _complementing_ `Cage`s are found and `Cage` slicing occurs.
            //
            this._model.addEventHandler(MasterModelEvents.CAGE_REGISTERED, indexedCageMsTracker.cageRegisteredEventHandler);
            this._model.addEventHandler(MasterModelEvents.CAGE_UNREGISTERED, indexedCageMsTracker.cageUnregisteredEventHandler);

            // Running core work.
            this.doExecute(indexedCageMsTracker);
        } finally {
            // Cleanup event handlers even if error is thrown to avoid broken state.
            this._model.removeEventHandler(MasterModelEvents.CAGE_REGISTERED, indexedCageMsTracker.cageRegisteredEventHandler);
            this._model.removeEventHandler(MasterModelEvents.CAGE_UNREGISTERED, indexedCageMsTracker.cageUnregisteredEventHandler);
        }
    }

    private doExecute(indexedCageMsTracker: IndexedCageModelsTracker) {
        this._rowAreasProcessor.execute(indexedCageMsTracker);
        this._columnAreasProcessor.execute(indexedCageMsTracker);
        this._nonetAreasProcessor.execute();
    }

}

class ConstantProcessorContext {

    constructor(
            readonly context: Context,
            readonly model: MasterModel,
            readonly config: Config,
            readonly strategy: Strategy
    ) {}

}

type HouseCellsIndices = ReadonlyArray<ReadonlyCellIndicesCheckingSet>;
type NewCellsIteratorFn = (index: HouseIndex) => CellsIterator;

abstract class HouseAreasProcessor {

    protected readonly _masterToggle: boolean;
    protected readonly _processorCtx: ConstantProcessorContext;
    protected readonly _model: MasterModel;
    protected readonly _config: Config;

    constructor(masterToggle: boolean, processorCtx: ConstantProcessorContext) {
        this._masterToggle = masterToggle;
        this._processorCtx = processorCtx;
        this._model = processorCtx.model;
        this._config = processorCtx.config;
    }

    protected applyToIndividualHouses(houseCellsIndices: HouseCellsIndices, minAdjacentAreas: number) {
        if (minAdjacentAreas <= 1) {
            for (const index of House.COUNT_RANGE) {
                this.findAndSlice(
                    this.houseModel(index).cageModels,
                    1,
                    houseCellsIndices[index]
                );
            }
        }
    }

    protected findAndSlice(
            cageMs: ReadonlyArray<CageModel>,
            houseCount: number,
            areaCellIndices: ReadonlyCellIndicesCheckingSet) {
        const nHouseCellCount = Math.imul(houseCount, House.CELL_COUNT);
        const nHouseSum = Math.imul(houseCount, House.SUM);

        const cagesAreaModel = GridAreaModel.fromCageModels(cageMs, houseCount);

        const sum = nHouseSum - cagesAreaModel.nonOverlappingCagesAreaModel.sum;
        if (sum !== 0 && (houseCount === 1 || cagesAreaModel.nonOverlappingCagesAreaModel.cellCount >= nHouseCellCount - this._config.maxMeaningfulComplementSize)) {
            const residualCageBuilder = Cage.ofSum(sum);
            const complementIndices = areaCellIndices.and(cagesAreaModel.nonOverlappingCagesAreaModel.cellIndices.not());
            residualCageBuilder.withCells(complementIndices.cells());
            if (residualCageBuilder.cellCount == 1) {
                const cellM = this._processorCtx.model.cellModelOf(residualCageBuilder.cells[0]);
                cellM.placedNum = residualCageBuilder.new().sum;
                this._processorCtx.context.recentlySolvedCellModels = [ cellM ];
                this._processorCtx.strategy.executeAnother(ReduceCageNumOptsBySolvedCellsStrategy);
            } else {
                residualCageBuilder.setIsInput(this._processorCtx.model.isDerivedFromInputCage(residualCageBuilder.cells));
            }

            this._processorCtx.context.cageSlicer.addAndSliceResidualCageRecursively(residualCageBuilder.new());

            if (this._config.isCollectStats) {
                FindComplementingCagesStrategy.STATS.addFinding(houseCount, residualCageBuilder.cellCount);
            }
        }
    }

    protected abstract houseModel(index: HouseIndex): HouseModel;

    protected static cellsIndices(newCellsIteratorFn: NewCellsIteratorFn) {
        return House.COUNT_RANGE.map(row =>
            new CellIndicesCheckingSet(Array.from(newCellsIteratorFn(row)).map(cell => cell.index))
        );
    }

}

abstract class AdjacentHouseAreasProcessor extends HouseAreasProcessor {

    execute(indexedCageMsTracker: IndexedCageModelsTracker) {
        if (this._masterToggle) {
            this.doExecute(indexedCageMsTracker);
        }
    }

    abstract doExecute(indexedCageMsTracker: IndexedCageModelsTracker): void;

    protected applyToAdjacentHouses(
            indexedCages: ReadonlyArray<Set<CageModel>>,
            houseCellsIndices: HouseCellsIndices,
            minAdjacentAreas: number,
            maxAdjacentAreas: number) {
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
                        if (this.isWithinArea(cageM, rightOrBottomExclusive)) {
                            cageMs.push(cageM);
                        }
                    }
                    indices.add(houseCellsIndices[index]);
                    index++;
                } while (index < rightOrBottomExclusive);

                this.findAndSlice(cageMs, n, indices);
                topOrLeftIndex++;
            } while (topOrLeftIndex <= upperBound);
            n++;
        }
    }

    protected abstract isWithinArea(cageM: CageModel, bottomOrRightIndexExclusive: HouseIndex): boolean;

}

class RowAreasProcessor extends AdjacentHouseAreasProcessor {

    private static readonly _CELLS_INDICES: HouseCellsIndices = this.cellsIndices(Row.newCellsIterator);

    constructor(processorCtx: ConstantProcessorContext) {
        super(processorCtx.config.isApplyToRowAreas, processorCtx);
    }

    doExecute(indexedCageMsTracker: IndexedCageModelsTracker): void {
        this.applyToIndividualHouses(
            RowAreasProcessor._CELLS_INDICES,
            this._config.minAdjacentRowsAndColumnsAreas
        );
        this.applyToAdjacentHouses(
            indexedCageMsTracker.rowIndexedCages,
            RowAreasProcessor._CELLS_INDICES,
            this._config.minAdjacentRowsAndColumnsAreas,
            this._config.maxAdjacentRowsAndColumnsAreas
        );
    }

    protected houseModel(index: HouseIndex) {
        return this._model.rowModels[index];
    }

    protected isWithinArea(cageM: CageModel, bottomOrRightIndexExclusive: HouseIndex) {
        return cageM.maxRow < bottomOrRightIndexExclusive;
    }

}

class ColumnAreasProcessor extends AdjacentHouseAreasProcessor {

    private static readonly _CELLS_INDICES: HouseCellsIndices = this.cellsIndices(Column.newCellsIterator);

    constructor(processorCtx: ConstantProcessorContext) {
        super(processorCtx.config.isApplyToColumnAreas, processorCtx);
    }

    doExecute(indexedCageMsTracker: IndexedCageModelsTracker): void {
        this.applyToIndividualHouses(
            ColumnAreasProcessor._CELLS_INDICES,
            this._config.minAdjacentRowsAndColumnsAreas
        );
        this.applyToAdjacentHouses(
            indexedCageMsTracker.columnIndexedCages,
            ColumnAreasProcessor._CELLS_INDICES,
            this._config.minAdjacentRowsAndColumnsAreas,
            this._config.maxAdjacentRowsAndColumnsAreas
        );
    }

    protected houseModel(index: HouseIndex) {
        return this._model.columnModels[index];
    }

    protected isWithinArea(cageM: CageModel, bottomOrRightIndexExclusive: HouseIndex) {
        return cageM.maxCol < bottomOrRightIndexExclusive;
    }

}

class NonetAreasProcessor extends HouseAreasProcessor {

    private static readonly _CELLS_INDICES: HouseCellsIndices = this.cellsIndices(Nonet.newCellsIterator);

    constructor(processorCtx: ConstantProcessorContext) {
        super(processorCtx.config.isApplyToNonetAreas, processorCtx);
    }

    execute(): void {
        if (this._masterToggle) {
            this.applyToIndividualHouses(NonetAreasProcessor._CELLS_INDICES, 1);
        }
    }

    protected houseModel(index: HouseIndex) {
        return this._model.nonetModels[index];
    }

}
