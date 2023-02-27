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
     * Default is `5` which covers between 80% and 90% of all complements.
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

const DEFAULT_CONFIG: Config = {
    isApplyToRowAreas: true,
    isApplyToColumnAreas: true,
    isApplyToNonetAreas: true,
    minAdjacentRowsAndColumnsAreas: 1,
    maxAdjacentRowsAndColumnsAreas: 4,
    maxMeaningfulComplementCageSize: 5,
    isCollectStats: false
};

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

export class FindAndSliceComplementsForGridAreasStrategy extends Strategy {

    private readonly _config: Config;

    static readonly STATS = new Stats();

    constructor(context: Context, config: Partial<Config> = DEFAULT_CONFIG) {
        super(context);
        this._config = { ...DEFAULT_CONFIG, ...config };
    }

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
