import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { House, HouseIndex } from '../../../puzzle/house';
import { CachedNumRanges } from '../../math/cachedNumRanges';
import { CageModel } from '../../models/elements/cageModel';
import { GridAreaModel } from '../../models/elements/gridAreaModel';
import { MasterModel, MasterModelEvents } from '../../models/masterModel';
import { Context } from '../context';
import { Strategy } from '../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';

export type Config = {
    readonly isApplyToRowAreas: boolean;
    readonly isApplyToColumnAreas: boolean;
    readonly isApplyToNonetAreas: boolean;
    readonly minAdjacentHouses: number;
    readonly maxAdjacentHouses: number;
    readonly maxComplementSize: number;
    readonly isCollectStats: boolean;
}

const DEFAULT_CONFIG: Config = {
    isApplyToRowAreas: true,
    isApplyToColumnAreas: true,
    isApplyToNonetAreas: true,
    minAdjacentHouses: 1,
    maxAdjacentHouses: 4,
    maxComplementSize: 5,
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

class IndexedCages {
    readonly minIndexCages: Array<Set<CageModel>>;
    readonly maxIndexCages: Array<Set<CageModel>>;

    constructor() {
        this.minIndexCages = new Array(House.CELL_COUNT);
        this.maxIndexCages = new Array(House.CELL_COUNT);
        for (const i of CachedNumRanges.ZERO_TO_N_LTE_81[House.CELL_COUNT]) {
            this.minIndexCages[i] = new Set();
            this.maxIndexCages[i] = new Set();
        }
    }
}

class ExecContext {
    readonly rowIndexedCages: IndexedCages;
    readonly columnIndexedCages: IndexedCages;
    readonly recentlyRegisteredCageMs: Array<CageModel> = [];
    readonly recentlyUnregisteredCageMs: Array<CageModel> = [];

    constructor(model: MasterModel) {
        this.rowIndexedCages = new IndexedCages();
        this.columnIndexedCages = new IndexedCages();
        for (const cageM of model.cageModelsMap.values()) {
            this.rowIndexedCages.minIndexCages[cageM.minRow].add(cageM);
            this.rowIndexedCages.maxIndexCages[cageM.maxRow].add(cageM);
            this.columnIndexedCages.minIndexCages[cageM.minCol].add(cageM);
            this.columnIndexedCages.maxIndexCages[cageM.maxCol].add(cageM);
        }
    }

    readonly cageRegisteredEventHandler = (cageM: CageModel) => {
        this.rowIndexedCages.minIndexCages[cageM.minRow].add(cageM);
        this.rowIndexedCages.maxIndexCages[cageM.maxRow].add(cageM);
        this.columnIndexedCages.minIndexCages[cageM.minCol].add(cageM);
        this.columnIndexedCages.maxIndexCages[cageM.maxCol].add(cageM);
        this.recentlyRegisteredCageMs.push(cageM);
    };
    readonly cageUnregisteredEventHandler = (cageM: CageModel) => {
        this.rowIndexedCages.minIndexCages[cageM.minRow].delete(cageM);
        this.rowIndexedCages.maxIndexCages[cageM.maxRow].delete(cageM);
        this.columnIndexedCages.minIndexCages[cageM.minCol].delete(cageM);
        this.columnIndexedCages.maxIndexCages[cageM.maxCol].delete(cageM);
        this.recentlyUnregisteredCageMs.push(cageM);
    };

    clearRecentlyRegisteredAndUnregisteredCageMs() {
        this.recentlyRegisteredCageMs.length = 0;
        this.recentlyUnregisteredCageMs.length = 0;
    }
};

export class FindAndSliceComplementsForGridAreasStrategy extends Strategy {

    private readonly _config: Config;
    private readonly _rowAndColumnIterationRange: ReadonlyArray<number>;

    static readonly STATS = new Stats();

    constructor(context: Context, config: Partial<Config> = DEFAULT_CONFIG) {
        super(context);
        this._config = { ...DEFAULT_CONFIG, ...config };
        this._rowAndColumnIterationRange = _.range(this._config.minAdjacentHouses, this._config.maxAdjacentHouses + 1);
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
            this.applyToRowsOrColumns(ctx, ctx.rowIndexedCages, FindAndSliceComplementsForGridAreasStrategy.isRowWithinArea, (row: HouseIndex) => {
                return this._model.rowModels[row].cellsIterator();
            });
        }
        if (this._config.isApplyToColumnAreas) {
            this.applyToRowsOrColumns(ctx, ctx.columnIndexedCages, FindAndSliceComplementsForGridAreasStrategy.isColumnWithinArea, (row: HouseIndex) => {
                return this._model.columnModels[row].cellsIterator();
            });
        }
        if (this._config.isApplyToNonetAreas) {
            this.applyToNonetAreas();
        }
    }

    private static isRowWithinArea(cageM: CageModel, topOrLeftIndex: number, bottomOrRightIndexExclusive: number) {
        return cageM.minRow >= topOrLeftIndex && cageM.maxRow < bottomOrRightIndexExclusive;
    }

    private static isColumnWithinArea(cageM: CageModel, topOrLeftIndex: number, bottomOrRightIndexExclusive: number) {
        return cageM.minCol >= topOrLeftIndex && cageM.maxCol < bottomOrRightIndexExclusive;
    }

    private applyToRowsOrColumns(ctx: ExecContext, indexedCages: IndexedCages, isWithinAreaFn: (cageM: CageModel, topOrLeftIndex: number, bottomOrRightIndexExclusive: number) => boolean, cellIteratorFn: (index: number) => Iterable<Cell>) {
        const minIndexedCages = indexedCages.minIndexCages;
        const maxIndexedCages = indexedCages.maxIndexCages;
        for (const n of this._rowAndColumnIterationRange) {
            const cages = new Set<Cage>();
            for (const topOrLeftIndex of this.rowAndColumnLeftIndexRange(n)) {
                const rightOrBottomExclusive = topOrLeftIndex + n;
                if (n === 1 || topOrLeftIndex === 0) {
                    cages.clear();
                    ctx.clearRecentlyRegisteredAndUnregisteredCageMs();
                    for (const index of _.range(topOrLeftIndex, rightOrBottomExclusive)) {
                        for (const cageM of minIndexedCages[index]) {
                            if (isWithinAreaFn(cageM, index, rightOrBottomExclusive)) {
                                cages.add(cageM.cage);
                            }
                        }
                    }
                } else {
                    // remove irrelevant Cages
                    for (const cageM of minIndexedCages[topOrLeftIndex - 1]) {
                        cages.delete(cageM.cage);
                    }
                    for (const cageM of ctx.recentlyUnregisteredCageMs) {
                        cages.delete(cageM.cage);
                    }

                    // add new actual Cages
                    for (const cageM of maxIndexedCages[rightOrBottomExclusive - 1]) {
                        if (isWithinAreaFn(cageM, topOrLeftIndex, rightOrBottomExclusive)) {
                            cages.add(cageM.cage);
                        }
                    }
                    for (const cageM of ctx.recentlyRegisteredCageMs) {
                        if (isWithinAreaFn(cageM, topOrLeftIndex, rightOrBottomExclusive)) {
                            cages.add(cageM.cage);
                        }
                    }
                    ctx.clearRecentlyRegisteredAndUnregisteredCageMs();
                }

                this._doDetermineAndSliceResidualCagesInAdjacentNHouseAreasPerf(cages, n, topOrLeftIndex, cellIteratorFn);
            }
        }
    }

    private rowAndColumnLeftIndexRange(n: number) {
        return CachedNumRanges.ZERO_TO_N_LTE_81[House.CELL_COUNT - n + 1];
    }

    private applyToNonetAreas() {
        CachedNumRanges.ZERO_TO_N_LTE_81[House.COUNT_OF_ONE_TYPE_PER_GRID].forEach((leftIndex: number) => {
            this.doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(1, leftIndex, (cageM: CageModel) => {
                return cageM.positioningFlags.isWithinNonet && cageM.cage.cells[0].nonet === leftIndex;
            }, (nonet: HouseIndex) => {
                return this._model.nonetModels[nonet].cellsIterator();
            });
        });
    }

    private doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n: number, leftIndex: number, withinHouseFn: (cageM: CageModel, rightIndexExclusive: number) => boolean, cellIteratorFn: (index: number) => Iterable<Cell>) {
        const nHouseCellCount = n * House.CELL_COUNT;
        const nHouseSum = n * House.SUM;

        const rightIndexExclusive = leftIndex + n;
        const cages = new Array<Cage>();
        for (const cageM of this._context.model.cageModelsMap.values()) {
            if (withinHouseFn(cageM, rightIndexExclusive)) {
                cages.push(cageM.cage);
            }
        }
        const cagesAreaModel = GridAreaModel.from(cages, n);
        const sum = nHouseSum - cagesAreaModel.nonOverlappingCagesAreaModel.sum;
        if ((n === 1 || cagesAreaModel.nonOverlappingCagesAreaModel.cellCount >= nHouseCellCount - this._config.maxComplementSize) && sum) {
            const residualCageBuilder = Cage.ofSum(sum);
            _.range(leftIndex, rightIndexExclusive).forEach(index => {
                for (const { row, col } of cellIteratorFn(index)) {
                    if (cagesAreaModel.nonOverlappingCagesAreaModel.cellIndices.doesNotHave(Cell.at(row, col).index)) {
                        residualCageBuilder.withCell(Cell.at(row, col));
                    }
                }
            });
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

    private _doDetermineAndSliceResidualCagesInAdjacentNHouseAreasPerf(cages: Set<Cage>, n: number, leftIndex: number, cellIteratorFn: (index: number) => Iterable<Cell>) {
        const nHouseCellCount = n * House.CELL_COUNT;
        const nHouseSum = n * House.SUM;

        const rightIndexExclusive = leftIndex + n;
        const cagesAreaModel = GridAreaModel.from(Array.from(cages), n);
        const sum = nHouseSum - cagesAreaModel.nonOverlappingCagesAreaModel.sum;
        if ((n === 1 || cagesAreaModel.nonOverlappingCagesAreaModel.cellCount >= nHouseCellCount - this._config.maxComplementSize) && sum) {
            const residualCageBuilder = Cage.ofSum(sum);
            _.range(leftIndex, rightIndexExclusive).forEach(index => {
                for (const { row, col } of cellIteratorFn(index)) {
                    if (cagesAreaModel.nonOverlappingCagesAreaModel.cellIndices.doesNotHave(Cell.at(row, col).index)) {
                        residualCageBuilder.withCell(Cell.at(row, col));
                    }
                }
            });
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
