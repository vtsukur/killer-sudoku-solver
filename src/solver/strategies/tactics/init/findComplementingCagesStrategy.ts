import { Cage } from '../../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell, CellsMatrix, ReadonlyCells } from '../../../../puzzle/cell';
import { Column } from '../../../../puzzle/column';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from '../../../../puzzle/grid';
import { House, HouseIndex } from '../../../../puzzle/house';
import { Nonet } from '../../../../puzzle/nonet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Puzzle } from '../../../../puzzle/puzzle';
import { Row } from '../../../../puzzle/row';
import { CageModel } from '../../../models/elements/cageModel';
import { GridAreaModel } from '../../../models/elements/gridAreaModel';
import { HouseModel } from '../../../models/elements/houseModel';
import { CageRegisteredEventHandler, CageUnregisteredEventHandler, MasterModel, MasterModelEvents } from '../../../models/masterModel';
import { CellIndicesSet, ReadonlyCellIndicesSet } from '../../../sets';
import { CageSlicer } from '../../../transform/cageSlicer';
import { Context } from '../../context';
import { Strategy } from '../../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from '../loop/reduceCageNumOptsBySolvedCellsStrategy';

/**
 * Configuration options for {@link FindComplementingCagesStrategy}
 * help tune production execution and tailor testing scenarios.
 *
 * @public
 */
export type Config = {

    /**
     * Whether to apply the {@link Strategy} to individual {@link Row}s
     * and adjacent {@link Row} areas.
     *
     * `Config.minAdjacentRowsAndColumnsAreas` and `Config.maxAdjacentRowsAndColumnsAreas`
     * configure the size of adjacent {@link Row} areas.
     *
     * The default value is `true`, enabling the {@link Strategy}
     * to {@link Row}s and adjacent {@link Row} areas.
     */
    readonly isApplyToRowAreas: boolean;

    /**
     * Whether to apply the {@link Strategy} to individual {@link Column}s
     * and adjacent {@link Column} areas.
     *
     * `Config.minAdjacentRowsAndColumnsAreas` and `Config.maxAdjacentRowsAndColumnsAreas`
     * configure the size of adjacent {@link Column} areas.
     *
     * The default value is `true`, enabling the {@link Strategy}
     * to {@link Column}s and adjacent {@link Column} areas.
     */
    readonly isApplyToColumnAreas: boolean;

    /**
     * Whether to apply the {@link Strategy} to {@link Nonet}s.
     *
     * Only individual {@link Nonet}s are analyzed, *not* adjacent {@link Nonet}s.
     *
     * The default value is `true`, enabling the {@link Strategy} to {@link Nonet}s.
     */
    readonly isApplyToNonetAreas: boolean;

    /**
     * The minimum amount of adjacent {@link Row} and {@link Column} areas
     * to apply the {@link Strategy} to.
     *
     * It should be in the range of `[1, 8]`.
     * The upper bound in this range excludes value `9`
     * since applying it to the entire {@link Grid} will *not* produce any hint.
     *
     * This configuration is relevant only when `Config.isApplyToRowAreas` or `Config.isApplyToColumnAreas`
     * is `true`.
     *
     * The default value is `1`, enabling the {@link Strategy}
     * to at least all individual {@link Row}s and {@link Column}s.
     */
    readonly minAdjacentRowsAndColumnsAreas: number;

    /**
     * The maximum amount of adjacent {@link Row} and {@link Column} areas
     * to apply the {@link Strategy} to.
     *
     * It should be in the range of `[1, 8]`.
     * The upper bound in this range excludes value `9`
     * since applying it to the entire {@link Grid} will *not* produce any hint.
     *
     * This configuration is relevant only when `Config.isApplyToRowAreas` or `Config.isApplyToColumnAreas`
     * is `true`.
     *
     * The default value is `4`, which covers over 90% of all
     * possible {@link Cage} complements.
     */
    readonly maxAdjacentRowsAndColumnsAreas: number;

    /**
     * The maximum amount of {@link Cell}s in a complementing {@link Cage}
     * to consider such a {@link Cage} as a successful search result.
     *
     * The smaller the {@link Cage}, the more hints it generates.
     * As a result, there is a limited sense of finding bigger {@link Cage}s
     * as it requires more execution power and memory with fewer produced suggestions
     * *unless* determining all possible hints is critical.
     *
     * It should be in the range of `[1, 9]`.
     *
     * The default value is `5`, which covers between 80% and 90% of all
     * possible {@link Cage} complements.
     */
    readonly maxComplementSize: number;

    /**
     * Whether to collect statistics about found complementing {@link Cage}s.
     *
     * It helps find the distribution of cases and understand real-world usage,
     * enabling further configruing of this {@link Config}.
     *
     * The default value is `false`, which disables the collection of statistics.
     */
    readonly isCollectingStats: boolean;

}

/**
 * Default {@link Config} options.
 *
 * Changing these defaults requires updating TSDoc for {@link Config}.
 */
const DEFAULT_CONFIG: Config = Object.freeze({
    isApplyToRowAreas: true,
    isApplyToColumnAreas: true,
    isApplyToNonetAreas: true,
    minAdjacentRowsAndColumnsAreas: 1,
    maxAdjacentRowsAndColumnsAreas: 4,
    maxComplementSize: 5,
    isCollectingStats: false
});

class HouseAreaStats {

    private readonly _adjacentHouseCount: number;
    private _totalCagesFound = 0;
    private readonly _foundCagesByCellCount: Array<number>;

    constructor(n: number) {
        this._adjacentHouseCount = n;
        this._foundCagesByCellCount = new Array(House.CELL_COUNT + 1).fill(0);
    }

    get adjacentHouseCount() {
        return this._adjacentHouseCount;
    }

    get totalCagesFound() {
        return this._totalCagesFound;
    }

    get foundCagesByCellCount(): ReadonlyArray<number> {
        return this._foundCagesByCellCount;
    }

    addFinding(cageCellCount: number) {
        this._foundCagesByCellCount[cageCellCount]++;
        this._totalCagesFound++;
    }

}

class Stats {

    private readonly _data: Array<HouseAreaStats>;
    private _totalCagesFound = 0;

    constructor() {
        this._data = new Array(House.COUNT);
        this.clear();
    }

    get data(): ReadonlyArray<HouseAreaStats> {
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
        for (const n of House.INDICES) {
            this._data[n] = new HouseAreaStats(n);
        }
        this._totalCagesFound = 0;
    }

}

/**
 * This {@link Strategy} for solving the Killer Sudoku {@link Puzzle}
 * finds _complementing_ {@link Cage}s for {@link Row}, {@link Column}, and {@link Nonet} areas
 * and registers them in the {@link MasterModel}.
 *
 * A _complementing_ {@link Cage} is a {@link Cage} that completes
 * {@link Row}, {@link Column}, or {@link Nonet} area
 * along with already present {@link Cage}s to cover the entire area with {@link Cell}s.
 *
 * For example, let us consider a single {@link Row} of index `1`
 * (the second {@link Row} in the {@link Grid}) with the following {@link Cell}s:
 *
 * ```
 * // (row, column)
 * (1, 0), (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8)
 * ```
 *
 * Let us assume this {@link Row} has the following {@link Cage}s already registered:
 *
 * ```
 * Cage 1. Sum: 14. Cells: (1, 0), (1, 1)
 * Cage 2. Sum: 10. Cells: (1, 3), (1, 4), (1, 5)
 * Cage 3. Sum: 5.  Cells: (1, 7), (1, 8)
 * ```
 *
 * One can observe that these {@link Cage}s occupy the following {@link Cell}s in the {@link Row} area:
 *
 * ```
 * (1, 0), (1, 1), (1, 3), (1, 4), (1, 5), (1, 7), (1, 8)
 * ```
 *
 * Any {@link Cage} does *not* occupy the following {@link Cell}s in this area:
 *
 * ```
 * (1, 2), (1, 6)
 * ```
 *
 * These 2 {@link Cell}s describe a _complement_ to existing {@link Cage}s,
 * and it is trivial to derive its sum given that sum of all {@link Cell}s in a {@link House} is `45`:
 *
 * ```
 * Complementing Cage. Sum: 16 (calculated as 45 - 14 - 10 - 5 = 16). Cells: (1, 2), (1, 6)
 * ```
 *
 * Such a complementing {@link Cage} reduces possible numbers to `7` and `9`
 * (unique Sudoku numbers that add up to `16`)
 * for its {@link Cell}s at positions `(1, 2)` and `(1, 6)`.
 *
 * And, since {@link House} has unique numbers, possible number options for `Cage 2` with sum `10`
 * and {@link Cell}s at locations `(1, 3)`, `(1, 4)`, `(1, 5)` reduce:
 * combination of numbers `1`, `2`, and `7` is irrelevant since it overlaps with `7`
 * residing in the complementing {@link Cage}.
 *
 * This way, more and more hints can be derived recursively by applying this and other {@link Strategy}-ies.
 *
 * The same approach is applied *not* only to {@link Row}s but also to {@link Column}s and {@link Nonet}s.
 *
 * Also, this {@link Strategy} applies complement determination to the areas of
 * adjacent {@link Row}s and {@link Column}s in addition to individual {@link Row}s and {@link Column}s.
 *
 * For example, the adjacent area of two {@link Column}s with indices 3 and 4
 * applies the technique to the {@link Cage}s in the following {@link Cell}s:
 *
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
 * Non-adjacent areas are *not* analyzed because such an analysis will produce no valuable hints,
 * given that _input_ {@link Cage}s have connected {@link Cell}s.
 *
 * {@link Nonet}s are analyzed only individually without considering adjacent {@link Nonet} areas.
 *
 * This type represents the _initialization_ {@link Strategy} applied at most once
 * at the beginning of solving process for a particular {@link Puzzle}.
 *
 * {@link Config} options allow configuring the way this {@link Strategy} works.
 *
 * @see Config
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
     * Constructs a new {@link Strategy} with the given solution {@link Context}
     * and {@link Config} options.
     *
     * @param context - Solution {@link Context}.
     * @param config - {@link Config} options to apply on top of the defaults.
     *
     * @see Strategy.constructor
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
     * @see Strategy.execute
     */
    execute() {
        const cageMsStorage = new IndexedCageModelsStorage(this._model);
        try {
            //
            // Adding event handlers to listen to `Cage` registration and deregistration
            // when finding _complementing_ `Cage`s and slicing `Cage`s.
            // This is necessary because slicing results in the addition and deletion of `Cage`s
            // which this class is tracking.
            //
            cageMsStorage.attachEventHandlers();

            // Running core work.
            this.doExecute(cageMsStorage);
        } finally {
            // Cleaning up event handlers to avoid a broken state even if an error throws.
            cageMsStorage.deattachEventHandlers();
        }
    }

    private doExecute(cageMsStorage: IndexedCageModelsStorage) {
        this._rowAreasProcessor.execute(cageMsStorage);
        this._columnAreasProcessor.execute(cageMsStorage);
        this._nonetAreasProcessor.execute();
    }

}

/**
 * Type alias for the array of {@link CageModel} `Set`s
 * indexed by {@link Cage}'s topmost {@link Row} or leftmost {@link Column}.
 */
type IndexedHouseCageModels = Array<Set<CageModel>>;

/**
 * Type alias for the read-only version of {@link IndexedHouseCageModels}.
 */
type ReadonlyIndexedHouseCageModels = ReadonlyArray<ReadonlySet<CageModel>>;

/**
 * Stores actual {@link CageModel}s
 * indexed by {@link Cage}'s topmost {@link Row} and leftmost {@link Column}.
 *
 * {@link MasterModel} event handlers help keep track of actual {@link CageModel}s
 * since {@link Cage}s are registered and unregistered
 * when finding _complementing_ `Cage`s and slicing `Cage`s.
 *
 * This data structure improves performance
 * since indexing allows faster enumeration of {@link CageModel}s
 * by their topmost {@link Row} and leftmost {@link Column}
 * as opposed to an iteration over all {@link CageModel}s
 * present within the {@link MasterModel}.
 */
class IndexedCageModelsStorage {

    private readonly _model: MasterModel;

    private readonly _rowIndexedCages: IndexedHouseCageModels;
    private readonly _columnIndexedCages: IndexedHouseCageModels;

    private readonly _cageRegisteredEventHandler: CageRegisteredEventHandler = (cageM: CageModel) => {
        this._rowIndexedCages[cageM.minRow].add(cageM);
        this._columnIndexedCages[cageM.minCol].add(cageM);
    };

    private readonly _cageUnregisteredEventHandler: CageUnregisteredEventHandler = (cageM: CageModel) => {
        this._rowIndexedCages[cageM.minRow].delete(cageM);
        this._columnIndexedCages[cageM.minCol].delete(cageM);
    };

    constructor(model: MasterModel) {
        this._model = model;

        this._rowIndexedCages = House.INDICES.map(() => new Set());
        this._columnIndexedCages = House.INDICES.map(() => new Set());

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

    attachEventHandlers() {
        this._model.addEventHandler(MasterModelEvents.CAGE_REGISTERED, this._cageRegisteredEventHandler);
        this._model.addEventHandler(MasterModelEvents.CAGE_UNREGISTERED, this._cageUnregisteredEventHandler);
    }

    deattachEventHandlers() {
        this._model.removeEventHandler(MasterModelEvents.CAGE_REGISTERED, this._cageRegisteredEventHandler);
        this._model.removeEventHandler(MasterModelEvents.CAGE_UNREGISTERED, this._cageUnregisteredEventHandler);
    }

};

/**
 * Context for {@link HouseAreasProcessor} execution.
 */
type ProcessorContext = {
    readonly context: Context,
    readonly model: MasterModel,
    readonly config: Config,
    readonly strategy: Strategy
}

/**
 * Type alias for the read-only array of sets of {@link Cell}s' indices that belong to {@link House}s.
 *
 * Array element of index `i` is a set with all {@link Cell}s of {@link House} of index `i`.
 */
type ReadonlyHouseCellsIndices = ReadonlyArray<ReadonlyCellIndicesSet>;

/**
 * Abstract processor for {@link House} areas
 * which defines the core work of the overall {@link FindComplementingCagesStrategy}.
 *
 * This class is agnostic to a particular {@link House} type it operates.
 *
 * Subclasses should extend this class with processing logic for specific {@link House} types.
 */
abstract class HouseAreasProcessor {

    protected readonly _isEnabled: boolean;
    protected readonly _isEnabledForIndividualHouses: boolean;
    protected readonly _isCollectingStats: boolean;

    protected readonly _context: Context;
    protected readonly _model: MasterModel;
    protected readonly _config: Config;
    protected readonly _strategy: Strategy;
    protected readonly _cageSlicer: CageSlicer;

    constructor(isEnabled: boolean, isEnabledForIndividualHouses: boolean, processorCtx: ProcessorContext) {
        this._isEnabled = isEnabled;
        this._isEnabledForIndividualHouses = isEnabledForIndividualHouses;
        this._isCollectingStats = processorCtx.config.isCollectingStats;

        this._context = processorCtx.context;
        this._model = processorCtx.model;
        this._config = processorCtx.config;
        this._strategy = processorCtx.strategy;
        this._cageSlicer = this._context.cageSlicer;
    }

    /**
     * Searches for _complementing_ {@link Cage}s within
     * individual {@link Row}s, {@link Column}s, or {@link Nonet}s.
     *
     * This method is agnostic to a particular {@link House} type it operates.
     *
     * Sub-classes need to:
     *
     *  - pass appropriate {@link houseCellsIndices} input;
     *  - define {@link houseModel} behavior.
     *
     * Search happens if the value of {@link Config.minAdjacentRowsAndColumnsAreas} is `1`.
     *
     * @param houseCellsIndices - Array of sets
     * of {@link Cell}s' indices that belong to {@link House}s.
     * Array element of index `i` is a set
     * with all {@link Cell}s of {@link House} of index `i`.
     */
    protected applyToIndividualHouses(houseCellsIndices: ReadonlyHouseCellsIndices) {
        if (this._isEnabledForIndividualHouses) {
            for (const index of House.INDICES) {
                this.findAndSlice(this.houseModel(index).cageModels, houseCellsIndices[index], 1);
            }
        }
    }

    /**
     * Core method of the overall {@link FindComplementingCagesStrategy}
     * which determines _complementing_ {@link Cage} for an individual {@link House} or
     * adjacent {@link House} area and, in case a search is successful:
     *
     *  - registers _complementing_ {@link Cage} in the {@link MasterModel} with slicing;
     *  - executes {@link ReduceCageNumOptsBySolvedCellsStrategy} for single-{@link Cell} complement (if applicable);
     *  - records statistics (if applicable).
     *
     * @param areaCageMs - {@link CageModel}s within the target area.
     * @param areaCellIndices - Set with all {@link Cell}s of the target area.
     * @param houseCount - Amount of {@link House}s that cover the target area.
     *
     * @see CageSlicer
     */
    protected findAndSlice(
            areaCageMs: ReadonlyArray<CageModel>,
            areaCellIndices: ReadonlyCellIndicesSet,
            houseCount: number) {
        const complement = this.determineComplement(areaCageMs, areaCellIndices, houseCount);
        if (complement) {
            this._cageSlicer.addAndSliceResidualCageRecursively(complement);
            this.applySolvedCellsStrategyIfNecessary(complement);
            this.collectStatsIfNecessary(houseCount, complement);
        }
    }

    /**
     * Determines _complementing_ {@link Cage}
     * as the difference between the whole {@link House} area and
     * the area of {@link Cage}s within {@link GridAreaModel}, which do *not* have shared {@link Cell}s.
     *
     * @param areaCageMs - {@link CageModel}s within the target area.
     * @param areaCellIndices - Set with all {@link Cell}s of the target area.
     * @param houseCount - Amount of {@link House}s that cover the target area.
     *
     * @returns _Complementing_ {@link Cage}
     * as the difference between the whole {@link House} area and
     * the area of {@link Cage}s within {@link GridAreaModel} which do *not* have shared {@link Cell}s.
     *
     * Returns `undefined` if:
     *
     * - Found _complementing_ {@link Cage} is empty;
     * - Found _complementing_ {@link Cage} has more {@link Cell}s than {@link Config.maxComplementSize}
     * in case search runs on adjacent {@link House}s.
     * See {@link FindComplementingCagesStrategy} TSDoc for more info.
     */
    private determineComplement(
            areaCageMs: ReadonlyArray<CageModel>,
            areaCellIndices: ReadonlyCellIndicesSet,
            houseCount: number): Cage | undefined {
        const nHouseCellCount = Math.imul(houseCount, House.CELL_COUNT);

        const { nonOverlappingCagesAreaModel } = GridAreaModel.fromCageModels(areaCageMs, houseCount);

        const nHouseSum = Math.imul(houseCount, House.SUM);
        const minNonOverlappingAreaCellCount = nHouseCellCount - this._config.maxComplementSize;

        if (nonOverlappingCagesAreaModel.cellCount !== nHouseCellCount &&
                (houseCount === 1 || nonOverlappingCagesAreaModel.cellCount >= minNonOverlappingAreaCellCount)) {
            const sum = nHouseSum - nonOverlappingCagesAreaModel.sum;
            const cells = new CellIndicesSet(areaCellIndices).union(nonOverlappingCagesAreaModel.cellIndices.not()).cells();
            const cage = Cage.ofSum(sum)
                    .withCells(cells)
                    .setIsInput(this._model.isDerivedFromInputCage(cells))
                    .new();
            if (cage.placement.isWithinHouse) {
                return cage;
            }
        }
    }

    private applySolvedCellsStrategyIfNecessary(complement: Cage) {
        if (complement.cellCount === 1) {
            const cellM = this._model.cellModelOf(complement.firstCell);
            cellM.placedNum = complement.sum;
            this._context.recentlySolvedCellModels = [ cellM ];
            this._strategy.executeAnother(ReduceCageNumOptsBySolvedCellsStrategy);
        }
    }

    private collectStatsIfNecessary(houseCount: number, complement: Cage) {
        if (this._isCollectingStats) {
            FindComplementingCagesStrategy.STATS.addFinding(houseCount, complement.cellCount);
        }
    }

    /**
     * Returns the {@link HouseModel} of a specific type
     * ({@link Row}, {@link Column}, or {@link Nonet})
     * by its index within the {@link Grid}.
     *
     * This method allows to collect {@link House} {@link CageModel}s efficiently
     * since {@link HouseModel} already stores its {@link CageModel}s.
     *
     * Sub-classes should implement this method
     * to define specifics for particular {@link House} types.
     *
     * @param index - Index of the {@link House} to return {@link HouseModel} for.
     *
     * @returns {HouseModel} of a specific type
     * ({@link Row}, {@link Column}, or {@link Nonet})
     * by its index within the {@link Grid}.
     */
    protected abstract houseModel(index: HouseIndex): HouseModel;

    /**
     * Collects an array of sets where an element of index `i`
     * has all {@link Cell}s of {@link House} of index `i`.
     *
     * This method allows sub-classes to cache {@link Cell}s' indices
     * as they remain constant between iterations.
     *
     * @param cells - Matrix of {@link Cells} indexed by {@link House}.
     *
     * @returns Array of sets where an element of index `i`
     * has all {@link Cell}s of {@link House} of index `i`.
     */
    protected static cellsIndices(cells: CellsMatrix) {
        return House.INDICES.map(index =>
            new CellIndicesSet(cells[index].map(cell => cell.index))
        );
    }

}

/**
 * Abstract processor for adjacent {@link House} areas.
 *
 * This class is agnostic to a particular {@link House} type it operates.
 *
 * Subclasses should extend this class with processing logic for specific {@link House} types.
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
     * Executes core processing work if configuration permits.
     *
     * @param cageMsStorage - Stores actual {@link CageModel}s
     * indexed by {@link Cage}'s topmost {@link Row} and leftmost {@link Column}.
     */
    execute(cageMsStorage: IndexedCageModelsStorage) {
        if (this._isEnabled) {
            this.doExecute(cageMsStorage);
        }
    }

    /**
     * Executes core processing work.
     *
     * Sub-classes should implement this method
     * to define specifics for particular {@link House} types.
     *
     * @param cageMsStorage - Stores actual {@link CageModel}s
     * indexed by {@link Cage}'s topmost {@link Row} and leftmost {@link Column}.
     */
    abstract doExecute(cageMsStorage: IndexedCageModelsStorage): void;

    /**
     * Searches for _complementing_ {@link Cage}s within
     * adjacent {@link Row} or {@link Column} areas.
     *
     * This method is agnostic to a particular {@link House} type it operates,
     * but it does *not* apply to {@link Nonet}s.
     *
     * The search runs for each adjacent group sized in the range of
     * `[{@link Config.minAdjacentRowsAndColumnsAreas}, {@link Config.maxAdjacentRowsAndColumnsAreas}]`
     * with the lower bound always being above `1`.
     *
     * For example, if {@link Config.minAdjacentRowsAndColumnsAreas} is `1` and
     * {@link Config.maxAdjacentRowsAndColumnsAreas} is `4`,
     * the search will run for all adjacent groups of sized `2`, `3`, and `4` {@link House}s.
     *
     * For such a configuration in application to {@link Row}s,
     * the adjacent groups are as follows:
     *
     * ```
     * Adjacent groups of size 2:
     *  - Row 0, Row 1
     *  - Row 1, Row 2
     *  - Row 2, Row 3
     *  - Row 3, Row 4
     *  - Row 4, Row 5
     *  - Row 5, Row 6
     *  - Row 6, Row 7
     *  - Row 7, Row 8
     *
     * Adjacent groups of size 3:
     *  - Row 0, Row 1, Row 2
     *  - Row 1, Row 2, Row 3
     *  - Row 2, Row 3, Row 4
     *  - Row 3, Row 4, Row 5
     *  - Row 4, Row 5, Row 6
     *  - Row 5, Row 6, Row 7
     *  - Row 6, Row 7, Row 8
     *
     * Adjacent groups of size 4:
     *  - Row 0, Row 1, Row 2, Row 3
     *  - Row 1, Row 2, Row 3, Row 4
     *  - Row 2, Row 3, Row 4, Row 5
     *  - Row 3, Row 4, Row 5, Row 6
     *  - Row 4, Row 5, Row 6, Row 7
     *  - Row 5, Row 6, Row 7, Row 8
     * ```
     *
     * For the same configuration in application to {@link Column}s,
     * the adjacent groups are as follows:
     *
     * ```
     * Adjacent groups of size 2:
     *  - Column 0, Column 1
     *  - Column 1, Column 2
     *  - Column 2, Column 3
     *  - Column 3, Column 4
     *  - Column 4, Column 5
     *  - Column 5, Column 6
     *  - Column 6, Column 7
     *  - Column 7, Column 8
     *
     * Adjacent groups of size 3:
     *  - Column 0, Column 1, Column 2
     *  - Column 1, Column 2, Column 3
     *  - Column 2, Column 3, Column 4
     *  - Column 3, Column 4, Column 5
     *  - Column 4, Column 5, Column 6
     *  - Column 5, Column 6, Column 7
     *  - Column 6, Column 7, Column 8
     *
     * Adjacent groups of size 4:
     *  - Column 0, Column 1, Column 2, Column 3
     *  - Column 1, Column 2, Column 3, Column 4
     *  - Column 2, Column 3, Column 4, Column 5
     *  - Column 3, Column 4, Column 5, Column 6
     *  - Column 4, Column 5, Column 6, Column 7
     *  - Column 5, Column 6, Column 7, Column 8
     * ```
     *
     * @param indexedCageMs - Array of {@link CageModel} `Set`s
     * indexed by {@link Cage}'s topmost {@link Row} or leftmost {@link Column}.
     * @param houseCellsIndices - Array of sets of {@link Cell}s' indices that belong to {@link House}s.
     * Array element of index `i` is a set with all {@link Cell}s of {@link House} of index `i`.
     * @param minAdjacentAreas - See {@link Config.minAdjacentRowsAndColumnsAreas}.
     * @param maxAdjacentAreas - See {@link Config.maxAdjacentRowsAndColumnsAreas}.
     */
    protected applyToAdjacentHouses(
            indexedCageMs: ReadonlyIndexedHouseCageModels,
            houseCellsIndices: ReadonlyHouseCellsIndices,
            minAdjacentAreas: number,
            maxAdjacentAreas: number) {
        //
        // Making sure the logic skips individual `House`s
        // and takes `Config.maxAdjacentRowsAndColumnsAreas` into account.
        //
        let adjacentHouseCount = Math.max(minAdjacentAreas, 2);

        // Iterating over adjacent `House` areas sized in the target range.
        while (adjacentHouseCount <= maxAdjacentAreas) {
            const maxTopOrLeftIndex = House.CELL_COUNT - adjacentHouseCount;
            let topOrLeftIndex = 0;

            // Iterating over all adjacent `House` areas of a particular size.
            do {
                // Core work happens here.
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
        const areaCellsIndices = CellIndicesSet.newEmpty();
        let index = topOrLeftIndex;
        do {
            for (const cageM of indexedCageMs[index]) {
                if (this.isWithinArea(cageM, rightOrBottomExclusive)) {
                    areaCageMs.push(cageM);
                }
            }
            areaCellsIndices.addAll(houseCellsIndices[index]);
        } while (++index < rightOrBottomExclusive);

        return { areaCageMs, areaCellsIndices };
    }

    /**
     * Checks whether given {@link CageModel}'s {@link Cage}
     * resides within the adjacent {@link House} area.
     *
     * This method checks only the upper bound coordinate
     * of the {@link CageModel}'s {@link Cage}
     * as the use of {@link IndexedCageModelsStorage}
     * should already consider the lower bound.
     *
     * Sub-classes should implement this method
     * to define specifics for particular {@link House} types.
     *
     * @param cageM - {@link CageModel}'s {@link Cage}
     * to check for being within the adjacent {@link House} area.
     * @param bottomOrRightIndexExclusive - The upper bound coordinate
     * of the adjacent {@link House} area.
     *
     * @returns `true` if given {@link CageModel}'s {@link Cage}
     * resides within the adjacent {@link House} area;
     * otherwise `false`.
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
     * This data structure improves performance and minimizes memory footprint
     * due to the manipulation on bits via fast bitwise operations.
     */
    private static readonly _CELLS_INDICES = this.cellsIndices(Row.CELLS);

    private readonly _rowModels;

    constructor(processorCtx: ProcessorContext) {
        super(processorCtx.config.isApplyToRowAreas, processorCtx);
        this._rowModels = this._model.rowModels;
    }

    doExecute(cageMsStorage: IndexedCageModelsStorage): void {
        this.applyToIndividualHouses(RowAreasProcessor._CELLS_INDICES);
        this.applyToAdjacentHouses(
            cageMsStorage.rowIndexedCages,
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
     * This data structure improves performance and minimizes memory footprint
     * due to the manipulation on bits via fast bitwise operations.
     */
    private static readonly _CELLS_INDICES = this.cellsIndices(Column.CELLS);

    private readonly _columnModels;

    constructor(processorCtx: ProcessorContext) {
        super(processorCtx.config.isApplyToColumnAreas, processorCtx);
        this._columnModels = this._model.columnModels;
    }

    doExecute(cageMsStorage: IndexedCageModelsStorage): void {
        this.applyToIndividualHouses(ColumnAreasProcessor._CELLS_INDICES);
        this.applyToAdjacentHouses(
            cageMsStorage.columnIndexedCages,
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
     * This data structure improves performance and minimizes memory footprint
     * due to the manipulation on bits via fast bitwise operations.
     */
    private static readonly _CELLS_INDICES = this.cellsIndices(Nonet.CELLS);

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
