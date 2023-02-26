import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { Column } from '../../../puzzle/column';
import { House, HouseIndex } from '../../../puzzle/house';
import { Nonet } from '../../../puzzle/nonet';
import { Row } from '../../../puzzle/row';
import { CachedNumRanges } from '../../math/cachedNumRanges';
import { CageModel } from '../../models/elements/cageModel';
import { GridAreaModel } from '../../models/elements/gridAreaModel';
import { HouseModel } from '../../models/elements/houseModel';
import { MasterModel, MasterModelEvents } from '../../models/masterModel';
import { Context } from '../context';
import { Strategy } from '../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';

export type Config = {
    readonly isApplyToRowAreas: boolean;
    readonly isApplyToColumnAreas: boolean;
    readonly isApplyToNonetAreas: boolean;
    readonly minAdjacentRowsAndColumnsAreas: number;
    readonly maxAdjacentRowsAndColumnsAreas: number;
    readonly maxComplementSize: number;
    readonly isCollectStats: boolean;
}

const DEFAULT_CONFIG: Config = {
    isApplyToRowAreas: true,
    isApplyToColumnAreas: true,
    isApplyToNonetAreas: true,
    minAdjacentRowsAndColumnsAreas: 1,
    maxAdjacentRowsAndColumnsAreas: 4,
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
    private readonly _rowAndColumnIterationRange: ReadonlyArray<number>;

    static readonly STATS = new Stats();

    constructor(context: Context, config: Partial<Config> = DEFAULT_CONFIG) {
        super(context);
        this._config = { ...DEFAULT_CONFIG, ...config };
        this._rowAndColumnIterationRange = _.range(this._config.minAdjacentRowsAndColumnsAreas, this._config.maxAdjacentRowsAndColumnsAreas + 1);
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
                FindAndSliceComplementsForGridAreasStrategy.rowCellsIterator,
                this._config.minAdjacentRowsAndColumnsAreas,
                this._config.maxAdjacentRowsAndColumnsAreas
            );
        }
        if (this._config.isApplyToColumnAreas) {
            this.applyToAreasOfSingleType(
                ctx.columnIndexedCages,
                (index: HouseIndex) => this._model.columnModels[index],
                FindAndSliceComplementsForGridAreasStrategy.isColumnWithinArea_upperBoundartCheckOnly,
                FindAndSliceComplementsForGridAreasStrategy.columnCellsIterator,
                this._config.minAdjacentRowsAndColumnsAreas,
                this._config.maxAdjacentRowsAndColumnsAreas
            );
        }
        if (this._config.isApplyToNonetAreas) {
            this.applyToAreasOfSingleType(
                ctx.columnIndexedCages, // not used
                (index: HouseIndex) => this._model.nonetModels[index],
                FindAndSliceComplementsForGridAreasStrategy.isColumnWithinArea_upperBoundartCheckOnly, // not used
                FindAndSliceComplementsForGridAreasStrategy.nonetCellsIterator,
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

    private static rowCellsIterator(row: HouseIndex) {
        return Row.newCellsIterator(row);
    }

    private static columnCellsIterator(row: HouseIndex) {
        return Column.newCellsIterator(row);
    }

    private static nonetCellsIterator(row: HouseIndex) {
        return Nonet.newCellsIterator(row);
    }

    private applyToAreasOfSingleType(
            indexedCages: ReadonlyArray<Set<CageModel>>,
            singleHouseCageModelsFn: (index: number) => HouseModel,
            isWithinAreaFn: (cageM: CageModel, bottomOrRightIndexExclusive: number) => boolean,
            cellIteratorFn: (index: number) => Iterable<Cell>,
            minAdjacentAreas: number,
            maxAdjacentAreas: number) {
        if (minAdjacentAreas <= 1 && maxAdjacentAreas >= 1) {
            for (const index of CachedNumRanges.ZERO_TO_N_LTE_81[House.COUNT_OF_ONE_TYPE_PER_GRID]) {
                this.doFindAndSliceComplementsForAdjacentGridAreas(
                    singleHouseCageModelsFn(index).cageModels,
                    1,
                    index,
                    cellIteratorFn
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
                let index = topOrLeftIndex;
                do {
                    for (const cageM of indexedCages[index]) {
                        if (isWithinAreaFn(cageM, rightOrBottomExclusive)) {
                            cageMs.push(cageM);
                        }
                    }
                    index++;
                } while (index < rightOrBottomExclusive);

                this.doFindAndSliceComplementsForAdjacentGridAreas(cageMs, n, topOrLeftIndex, cellIteratorFn);
                topOrLeftIndex++;
            } while (topOrLeftIndex <= upperBound);
            n++;
        }
    }

    private doFindAndSliceComplementsForAdjacentGridAreas(cageMs: ReadonlyArray<CageModel>, n: number, leftIndex: number, cellIteratorFn: (index: number) => Iterable<Cell>) {
        const nHouseCellCount = n * House.CELL_COUNT;
        const nHouseSum = n * House.SUM;

        const rightIndexExclusive = leftIndex + n;
        const cagesAreaModel = GridAreaModel.fromCageModels(cageMs, n);
        const sum = nHouseSum - cagesAreaModel.nonOverlappingCagesAreaModel.sum;
        if ((n === 1 || cagesAreaModel.nonOverlappingCagesAreaModel.cellCount >= nHouseCellCount - this._config.maxComplementSize) && sum) {
            const residualCageBuilder = Cage.ofSum(sum);
            let index = leftIndex;
            do {
                for (const { row, col } of cellIteratorFn(index)) {
                    if (cagesAreaModel.nonOverlappingCagesAreaModel.cellIndices.doesNotHave(Cell.at(row, col).index)) {
                        residualCageBuilder.withCell(Cell.at(row, col));
                    }
                }
                index++;
            } while (index < rightIndexExclusive);
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
