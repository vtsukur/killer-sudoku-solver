import { Cage } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
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
import { CageSlicer } from '../../transform/cageSlicer';
import { Context } from '../context';
import { Strategy } from '../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';

/**
 * Configuration options for {@link FindComplementingCagesStrategy}.
 *
 * Can be used for both tuning production execution as well as tailoring testing scenarios.
 *
 * @public
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

type ReadonlyIndexedHouseCageModels = ReadonlyArray<Set<CageModel>>;
type IndexedHouseCageModels = Array<Set<CageModel>>;

class IndexedCageModelsTracker {

    private readonly _rowIndexedCages: IndexedHouseCageModels;
    private readonly _columnIndexedCages: IndexedHouseCageModels;

    constructor(model: MasterModel) {
        this._rowIndexedCages = new Array(House.CELL_COUNT);
        this._columnIndexedCages = new Array(House.CELL_COUNT);
        for (const i of CachedNumRanges.ZERO_TO_N_LTE_81[House.CELL_COUNT]) {
            this._rowIndexedCages[i] = new Set();
            this._columnIndexedCages[i] = new Set();
        }
        for (const cageM of model.cageModelsMap.values()) {
            this._rowIndexedCages[cageM.minRow].add(cageM);
            this._columnIndexedCages[cageM.minCol].add(cageM);
        }
    }

    get rowIndexedCages(): ReadonlyIndexedHouseCageModels {
        return this._rowIndexedCages;
    }

    get columnIndexedCages(): ReadonlyIndexedHouseCageModels {
        return this._columnIndexedCages;
    }

    readonly cageRegisteredEventHandler = (cageM: CageModel) => {
        this._rowIndexedCages[cageM.minRow].add(cageM);
        this._columnIndexedCages[cageM.minCol].add(cageM);
    };

    readonly cageUnregisteredEventHandler = (cageM: CageModel) => {
        this._rowIndexedCages[cageM.minRow].delete(cageM);
        this._columnIndexedCages[cageM.minCol].delete(cageM);
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
 *
 * @public
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
     * @param context - Solution {@link Context}.
     * @param config - {@link Config} options to apply on top of the defaults.
     *
     * @see {Strategy.constructor}
     */
    constructor(context: Context, config: Partial<Config> = DEFAULT_CONFIG) {
        super(context);

        this._config = { ...DEFAULT_CONFIG, ...config };

        const processorCtx: ProcessorContext = {
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
            // This is necessary because slicing results in adding and removing of `Cage`s
            // which this class needs to be aware of.
            //
            this._model.addEventHandler(MasterModelEvents.CAGE_REGISTERED, indexedCageMsTracker.cageRegisteredEventHandler);
            this._model.addEventHandler(MasterModelEvents.CAGE_UNREGISTERED, indexedCageMsTracker.cageUnregisteredEventHandler);

            // Running core work.
            this.doExecute(indexedCageMsTracker);
        } finally {
            // Cleanup of event handlers even if error is thrown to avoid broken state.
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

/**
 * Context for {@link HouseAreasProcessor} execution.
 */
class ProcessorContext {

    constructor(
            readonly context: Context,
            readonly model: MasterModel,
            readonly config: Config,
            readonly strategy: Strategy
    ) {}

}

/**
 * Type alias for the array of checking sets of {@link Cell}s' indices that belong to {@link House}s.
 *
 * Array element of index `i` is a checking set with all {@link Cell}s of {@link House} of index `i`.
 */
type ReadonlyHouseCellsIndices = ReadonlyArray<ReadonlyCellIndicesCheckingSet>;

/**
 * Type alias for the function producing {@link CellsIterator} for a {@link House} by index.
 */
type NewCellsIteratorFn = (index: HouseIndex) => CellsIterator;

/**
 * Abstract processor for {@link House} areas
 * which defines key work of the overall {@link FindComplementingCagesStrategy}.
 *
 * This class is agnostic to a particular {@link House} type it operates with.
 *
 * This class is designed to be extended with processing logic for specific {@link House} type.
 */
abstract class HouseAreasProcessor {

    protected readonly _isEnabled: boolean;
    protected readonly _isEnabledForIndividualHouses: boolean;
    protected readonly _isCollectStats: boolean;

    protected readonly _context: Context;
    protected readonly _model: MasterModel;
    protected readonly _config: Config;
    protected readonly _strategy: Strategy;
    protected readonly _cageSlicer: CageSlicer;

    constructor(isEnabled: boolean, isEnabledForIndividualHouses: boolean, processorCtx: ProcessorContext) {
        this._isEnabled = isEnabled;
        this._isEnabledForIndividualHouses = isEnabledForIndividualHouses;
        this._isCollectStats = processorCtx.config.isCollectStats;

        this._context = processorCtx.context;
        this._model = processorCtx.model;
        this._config = processorCtx.config;
        this._strategy = processorCtx.strategy;
        this._cageSlicer = this._context.cageSlicer;
    }

    /**
     * Searches for _complementing_ {@link Cage}s within
     * individual {@link Row}s, {@link Column}s or {@link Nonet}s.
     *
     * This method is agnostic to a particular {@link House} type it operates with.
     *
     * Designed to be called by sub-classes which need to:
     *
     *  - pass appropriate {@link houseCellsIndices} input;
     *  - define {@link houseModel} behavior.
     *
     * Search is executed only if {@link Config.minAdjacentRowsAndColumnsAreas} is set to `1`.
     *
     * @param houseCellsIndices - Array of checking sets of {@link Cell}s' indices that belong to {@link House}s.
     * Array element of index `i` is a checking set with all {@link Cell}s of {@link House} of index `i`.
     * Use of this data structure enhances implementation performance and minimizes memory footprint
     * due to manipulation on bits via fast bitwise operations.
     */
    protected applyToIndividualHouses(houseCellsIndices: ReadonlyHouseCellsIndices) {
        if (this._isEnabledForIndividualHouses) {
            for (const index of House.COUNT_RANGE) {
                this.findAndSlice(this.houseModel(index).cageModels, houseCellsIndices[index], 1);
            }
        }
    }

    /**
     * Key method of the overall {@link FindComplementingCagesStrategy}
     * which determines _complementing_ {@link Cage} for an individual {@link House} or
     * adjacent {@link House} area and, if such a {@link Cage} is found:
     *
     *  - registeres it in the {@link MasterModel} with slicing;
     *  - applies {@link ReduceCageNumOptsBySolvedCellsStrategy} for single-{@link Cell} complement (if applicable);
     *  - and records statistics (if applicable).
     *
     * Designed to be called by sub-classes.
     *
     * @param areaCageMs - {@link CageModel}s within the target area.
     * @param areaCellIndices - Checking set with all {@link Cell}s of the target area.
     * Use of this data structure enhances implementation performance and minimizes memory footprint
     * due to manipulation on bits via fast bitwise operations.
     * @param houseCount - Amount of {@link House}s which cover the target area.
     *
     * @see {CageSlicer}
     */
    protected findAndSlice(
            areaCageMs: ReadonlyArray<CageModel>,
            areaCellIndices: ReadonlyCellIndicesCheckingSet,
            houseCount: number) {
        const complement = this.determineMeaningfulComplement(areaCageMs, areaCellIndices, houseCount);
        if (complement) {
            this._cageSlicer.addAndSliceResidualCageRecursively(complement);
            this.applySolvedCellsStrategyIfNecessary(complement);
            this.collectStatsIfNecessary(houseCount, complement);
        }
    }

    /**
     * Determines _complementing_ {@link Cage}
     * as the difference between the whole {@link House} area and
     * the area of {@link Cage}s within {@link GridAreaModel} which do NOT have shared {@link Cell}s.
     *
     * @param areaCageMs - {@link CageModel}s within the target area.
     * @param areaCellIndices - Checking set with all {@link Cell}s of the target area.
     * Use of this data structure enhances implementation performance and minimizes memory footprint
     * due to manipulation on bits via fast bitwise operations.
     * @param houseCount - Amount of {@link House}s which cover the target area.
     *
     * @returns _Complementing_ {@link Cage}
     * as the difference between the whole {@link House} area and
     * the area of {@link Cage}s within {@link GridAreaModel} which do NOT have shared {@link Cell}s OR
     * `undefined` if:
     *
     * - Found _complementing_ {@link Cage} is empty;
     * - Found _complementing_ {@link Cage} has more {@link Cell}s than {@link Config.maxMeaningfulComplementSize}
     * in case search is performed on adjacent {@link House}s. See {@see FindComplementingCagesStrategy} TSDoc for more info.
     */
    private determineMeaningfulComplement(
            areaCageMs: ReadonlyArray<CageModel>,
            areaCellIndices: ReadonlyCellIndicesCheckingSet,
            houseCount: number): Cage | undefined {
        const nHouseCellCount = Math.imul(houseCount, House.CELL_COUNT);

        const { nonOverlappingCagesAreaModel } = GridAreaModel.fromCageModels(areaCageMs, houseCount);

        const nHouseSum = Math.imul(houseCount, House.SUM);
        const minNonOverlappingAreaCellCount = nHouseCellCount - this._config.maxMeaningfulComplementSize;

        if (nonOverlappingCagesAreaModel.cellCount !== nHouseCellCount &&
                (houseCount === 1 || nonOverlappingCagesAreaModel.cellCount >= minNonOverlappingAreaCellCount)) {
            const sum = nHouseSum - nonOverlappingCagesAreaModel.sum;
            const cells = areaCellIndices.and(nonOverlappingCagesAreaModel.cellIndices.not()).cells();
            return Cage.ofSum(sum)
                .withCells(cells)
                .setIsInput(this._model.isDerivedFromInputCage(cells))
                .new();
        }
    }

    private applySolvedCellsStrategyIfNecessary(complement: Cage) {
        if (complement.cellCount === 1) {
            const cellM = this._model.cellModelOf(complement.cells[0]);
            cellM.placedNum = complement.sum;
            this._context.recentlySolvedCellModels = [ cellM ];
            this._strategy.executeAnother(ReduceCageNumOptsBySolvedCellsStrategy);
        }
    }

    private collectStatsIfNecessary(houseCount: number, complement: Cage) {
        if (this._isCollectStats) {
            FindComplementingCagesStrategy.STATS.addFinding(houseCount, complement.cellCount);
        }
    }

    /**
     * Returns {@link HouseModel} of specific type ({@link Row}, {@link Column} or {@link Nonet})
     * by its index within the {@link Grid}.
     *
     * Supposed to be used for efficient collection of {@link House} {@link Cage}s
     * since they are already stored within the {@link HouseModel}.
     *
     * Should be implemented by sub-classes to define specifics for a particular {@link House} type.
     *
     * @param index - Index of the {@link House} to return {@link HouseModel} for.
     *
     * @returns {@link HouseModel} of specific type ({@link Row}, {@link Column} or {@link Nonet})
     * by its index within the {@link Grid}.
     */
    protected abstract houseModel(index: HouseIndex): HouseModel;

    /**
     * Collects array of checking sets where element of index `i`
     * has all {@link Cell}s of {@link House} of index `i`.
     *
     * Supposed to be used by sub-classes for caching {@link Cell}s indices
     * as they remain constant between iterations.
     *
     * @param newCellsIteratorFn - Function producing {@link CellsIterator} for a {@link House} by index.
     *
     * @returns Array of checking sets where element of index `i`
     * has all {@link Cell}s of {@link House} of index `i`.
     */
    protected static cellsIndices(newCellsIteratorFn: NewCellsIteratorFn) {
        return House.COUNT_RANGE.map(row =>
            new CellIndicesCheckingSet(Array.from(newCellsIteratorFn(row)).map(cell => cell.index))
        );
    }

}

/**
 * Abstract processor for adjacent {@link House} areas.
 *
 * This class is agnostic to a particular {@link House} type it operates with.
 *
 * This class is designed to be extended with processing logic for specific {@link House} type.
 */
abstract class AdjacentHouseAreasProcessor extends HouseAreasProcessor {

    protected readonly _minAdjacentCount;
    protected readonly _maxAdjacentCount;

    constructor(isEnabled: boolean, processorCtx: ProcessorContext) {
        super(isEnabled, processorCtx.config.minAdjacentRowsAndColumnsAreas === 1, processorCtx);
        this._minAdjacentCount = this._config.minAdjacentRowsAndColumnsAreas;
        this._maxAdjacentCount = this._config.maxAdjacentRowsAndColumnsAreas;
    }

    /**
     * Executes key processing work if configuration allows to do so.
     *
     * @param indexedCageMsTracker -
     */
    execute(indexedCageMsTracker: IndexedCageModelsTracker) {
        if (this._isEnabled) {
            this.doExecute(indexedCageMsTracker);
        }
    }

    /**
     * Executes key processing work.
     *
     * Should be implemented by sub-classes to define specifics for a particular {@link House} type.
     *
     * @param indexedCageMsTracker -
     */
    abstract doExecute(indexedCageMsTracker: IndexedCageModelsTracker): void;

    /**
     * Searches for _complementing_ {@link Cage}s within
     * adjacent {@link Row} or {@link Column} areas.
     *
     * This method is agnostic to a particular {@link House} type it operates with
     * (but NOT applicable to {@link Nonet}s).
     *
     * Search is executed for each adjacent group sized in the range of
     * `[{@link Config.minAdjacentRowsAndColumnsAreas}, {@link Config.maxAdjacentRowsAndColumnsAreas}]`
     * with lower bound always being above `1`.
     *
     * For example, if {@link Config.minAdjacentRowsAndColumnsAreas} is set to `1` and
     * {@link Config.maxAdjacentRowsAndColumnsAreas} is set to `4`,
     * search will be applied for all areas of adjacent groups sized `2`, `3` and `4` {@link House}s.
     *
     * Designed to be called by sub-classes.
     *
     * @param indexedCageMs - Array of {@link CageModel} `Set`s indexed by {@link Cage}'s topmost {@link Row} or
     * leftmost {@link Column}.
     * Use of this data structure enhances implementation performance
     * since indexing allows faster enumeration of {@link CageModel}s by their topmost/leftmost coordinate
     * as opposed to full enumeration of {@link CageModel}s present within the {@link MasterModel}.
     * @param houseCellsIndices - Array of checking sets of {@link Cell}s' indices that belong to {@link House}s.
     * Array element of index `i` is a checking set with all {@link Cell}s of {@link House} of index `i`.
     * Use of this data structure enhances implementation performance and minimizes memory footprint
     * due to manipulation on bits via fast bitwise operations.
     * @param minAdjacentAreas - See {@see Config.minAdjacentRowsAndColumnsAreas}.
     * @param maxAdjacentAreas - See {@see Config.maxAdjacentRowsAndColumnsAreas}.
     */
    protected applyToAdjacentHouses(
            indexedCageMs: ReadonlyIndexedHouseCageModels,
            houseCellsIndices: ReadonlyHouseCellsIndices,
            minAdjacentAreas: number,
            maxAdjacentAreas: number) {
        // Making sure individual `House`s are skipped and `Config.maxAdjacentRowsAndColumnsAreas` is taken into account.
        let adjacentHouseCount = Math.max(minAdjacentAreas, 2);

        // Iterating over adjacent `House` areas sizes in the target range.
        while (adjacentHouseCount <= maxAdjacentAreas) {
            const maxTopOrLeftIndex = House.CELL_COUNT - adjacentHouseCount;
            let topOrLeftIndex = 0;

            // Iterating over all adjacent `House` areas of a particular size.
            do {
                // Key work happens here.
                const { areaCageMs, areaCellsIndices } = this.collectAreaData(
                        topOrLeftIndex,
                        topOrLeftIndex + adjacentHouseCount,
                        indexedCageMs,
                        houseCellsIndices);
                this.findAndSlice(areaCageMs, areaCellsIndices, adjacentHouseCount);
            } while (++topOrLeftIndex <= maxTopOrLeftIndex);

            adjacentHouseCount++;
        }
    }

    private collectAreaData(
            topOrLeftIndex: number,
            rightOrBottomExclusive: number,
            indexedCageMs: ReadonlyIndexedHouseCageModels,
            houseCellsIndices: ReadonlyHouseCellsIndices) {
        const areaCageMs = new Array<CageModel>();
        const areaCellsIndices = CellIndicesCheckingSet.newEmpty();
        let index = topOrLeftIndex;
        do {
            for (const cageM of indexedCageMs[index]) {
                if (this.isWithinArea(cageM, rightOrBottomExclusive)) {
                    areaCageMs.push(cageM);
                }
            }
            areaCellsIndices.add(houseCellsIndices[index]);
        } while (++index < rightOrBottomExclusive);

        return { areaCageMs, areaCellsIndices };
    }

    /**
     * Checks whether given {@link CageModel}'s {@link Cage} resides within the adjacent {@link House} area.
     *
     * This method checks only the upper bound coordinate of the {@link CageModel}'s {@link Cage}:
     * lower bound is supposed to be taken into account already with the help of {@link IndexedCageModelsTracker}.
     *
     * Should be implemented by sub-classes to define specifics for a particular {@link House} type.
     *
     * @param cageM - {@link CageModel}'s {@link Cage} to check for being within the adjacent {@link House} area.
     * @param bottomOrRightIndexExclusive - upper bound coordinate of the adjacent {@link House} area.
     *
     * @returns `true` if given {@link CageModel}'s {@link Cage} resides within the adjacent {@link House} area;
     * othwerise `false`.
     */
    protected abstract isWithinArea(cageM: CageModel, bottomOrRightIndexExclusive: HouseIndex): boolean;

}

/**
 * Processor for individual {@link Row}s and adjacent {@link Row} areas.
 */
class RowAreasProcessor extends AdjacentHouseAreasProcessor {

    /**
     * Cache of {@link Cell}s' indices for all {@link Row}s
     * which remain constant between iterations.
     *
     * Use of this data structure enhances implementation performance and minimizes memory footprint
     * due to manipulation on bits via fast bitwise operations.
     */
    private static readonly _CELLS_INDICES = this.cellsIndices(Row.newCellsIterator);

    private readonly _rowModels;

    constructor(processorCtx: ProcessorContext) {
        super(processorCtx.config.isApplyToRowAreas, processorCtx);
        this._rowModels = this._model.rowModels;
    }

    doExecute(indexedCageMsTracker: IndexedCageModelsTracker): void {
        this.applyToIndividualHouses(RowAreasProcessor._CELLS_INDICES);
        this.applyToAdjacentHouses(
            indexedCageMsTracker.rowIndexedCages,
            RowAreasProcessor._CELLS_INDICES,
            this._minAdjacentCount,
            this._maxAdjacentCount
        );
    }

    protected houseModel(index: HouseIndex) {
        return this._rowModels[index];
    }

    protected isWithinArea(cageM: CageModel, bottomOrRightIndexExclusive: HouseIndex) {
        return cageM.maxRow < bottomOrRightIndexExclusive;
    }

}

/**
 * Processor for individual {@link Column}s and adjacent {@link Column} areas.
 */
class ColumnAreasProcessor extends AdjacentHouseAreasProcessor {

    /**
     * Cache of {@link Cell}s' indices for all {@link Column}s
     * which remain constant between iterations.
     *
     * Use of this data structure enhances implementation performance and minimizes memory footprint
     * due to manipulation on bits via fast bitwise operations.
     */
    private static readonly _CELLS_INDICES = this.cellsIndices(Column.newCellsIterator);

    private readonly _columnModels;

    constructor(processorCtx: ProcessorContext) {
        super(processorCtx.config.isApplyToColumnAreas, processorCtx);
        this._columnModels = this._model.columnModels;
    }

    doExecute(indexedCageMsTracker: IndexedCageModelsTracker): void {
        this.applyToIndividualHouses(ColumnAreasProcessor._CELLS_INDICES);
        this.applyToAdjacentHouses(
            indexedCageMsTracker.columnIndexedCages,
            ColumnAreasProcessor._CELLS_INDICES,
            this._minAdjacentCount,
            this._maxAdjacentCount
        );
    }

    protected houseModel(index: HouseIndex) {
        return this._columnModels[index];
    }

    protected isWithinArea(cageM: CageModel, bottomOrRightIndexExclusive: HouseIndex) {
        return cageM.maxCol < bottomOrRightIndexExclusive;
    }

}

/**
 * Processor for individual {@link Nonet}s.
 */
class NonetAreasProcessor extends HouseAreasProcessor {

    /**
     * Cache of {@link Cell}s' indices for all {@link Nonet}s
     * which remain constant between iterations.
     *
     * Use of this data structure enhances implementation performance and minimizes memory footprint
     * due to manipulation on bits via fast bitwise operations.
     */
    private static readonly _CELLS_INDICES = this.cellsIndices(Nonet.newCellsIterator);

    private readonly _nonetModels;

    constructor(processorCtx: ProcessorContext) {
        super(processorCtx.config.isApplyToNonetAreas, true, processorCtx);
        this._nonetModels = this._model.nonetModels;
    }

    execute(): void {
        if (this._isEnabled) {
            this.applyToIndividualHouses(NonetAreasProcessor._CELLS_INDICES);
        }
    }

    protected houseModel(index: HouseIndex) {
        return this._nonetModels[index];
    }

}
