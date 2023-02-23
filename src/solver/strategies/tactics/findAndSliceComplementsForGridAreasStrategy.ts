import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { House, HouseIndex } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { GridAreaModel } from '../../models/elements/gridAreaModel';
import { MasterModel } from '../../models/masterModel';
import { Context } from '../context';
import { Strategy } from '../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';

export type Config = {
    readonly isApplyToRowAreas: boolean;
    readonly isApplyToColumnAreas: boolean;
    readonly isApplyToNonetAreas: boolean;
    readonly minAdjacentHouses: number;
    readonly maxAdjacentHouses: number;
}

const DEFAULT_CONFIG: Config = {
    isApplyToRowAreas: true,
    isApplyToColumnAreas: true,
    isApplyToNonetAreas: true,
    minAdjacentHouses: 1,
    maxAdjacentHouses: 4
};

export class FindAndSliceComplementsForGridAreasStrategy extends Strategy {

    private readonly _config: Config;

    constructor(context: Context, config = DEFAULT_CONFIG) {
        super(context);
        this._config = config;
    }

    execute() {
        if (this._config.isApplyToRowAreas) {
            _.range(this._config.minAdjacentHouses, this._config.maxAdjacentHouses + 1).reverse().forEach((n: number) => {
                _.range(House.CELL_COUNT - n + 1).forEach((leftIndex: number) => {
                    doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this._context, n, leftIndex, (cageM: CageModel, rightIndexExclusive: number) => {
                        return cageM.minRow >= leftIndex && cageM.maxRow < rightIndexExclusive;
                    }, (row: HouseIndex) => {
                        return this._model.rowModels[row].cellsIterator();
                    }, this, this._model);
                });
            });
        }
        if (this._config.isApplyToColumnAreas) {
            _.range(this._config.minAdjacentHouses, this._config.maxAdjacentHouses + 1).reverse().forEach(n => {
                _.range(House.CELL_COUNT - n + 1).forEach((leftIndex: number) => {
                    doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this._context, n, leftIndex, (cageM: CageModel, rightIndexExclusive: number) => {
                        return cageM.minCol >= leftIndex && cageM.maxCol < rightIndexExclusive;
                    }, (col: HouseIndex) => {
                        return this._model.columnModels[col].cellsIterator();
                    }, this, this._model);
                });
            });
        }
        if (this._config.isApplyToNonetAreas) {
            _.range(House.CELL_COUNT).forEach((leftIndex: number) => {
                doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this._context, 1, leftIndex, (cageM: CageModel) => {
                    return cageM.positioningFlags.isWithinNonet && cageM.cage.cells[0].nonet === leftIndex;
                }, (nonet: HouseIndex) => {
                    return this._model.nonetModels[nonet].cellsIterator();
                }, this, this._model);
            });
        }
    }

}

// make part of the strategy class to avoid extra param passing
function doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(ctx: Context, n: number, leftIndex: number, withinHouseFn: (cageM: CageModel, rightIndexExclusive: number) => boolean, cellIteratorFn: (index: number) => Iterable<Cell>, strategy: Strategy, model: MasterModel) {
    const nHouseCellCount = n * House.CELL_COUNT;
    const nHouseSum = n * House.SUM;

    const rightIndexExclusive = leftIndex + n;
    let cages = new Array<Cage>();
    for (const cageM of ctx.model.cageModelsMap.values()) {
        if (withinHouseFn(cageM, rightIndexExclusive)) {
            cages = cages.concat(cageM.cage);
        }
    }
    const cagesAreaModel = GridAreaModel.from(cages, n);
    const sum = nHouseSum - cagesAreaModel.nonOverlappingCagesAreaModel.sum;
    if ((n === 1 || cagesAreaModel.nonOverlappingCagesAreaModel.cellCount > nHouseCellCount - 6) && sum) {
        const residualCageBuilder = Cage.ofSum(sum);
        _.range(leftIndex, rightIndexExclusive).forEach(index => {
            for (const { row, col } of cellIteratorFn(index)) {
                if (cagesAreaModel.nonOverlappingCagesAreaModel.cellIndices.doesNotHave(Cell.at(row, col).index)) {
                    residualCageBuilder.withCell(Cell.at(row, col));
                }
            }
        });
        if (residualCageBuilder.cellCount == 1) {
            const cellM = ctx.model.cellModelOf(residualCageBuilder.cells[0]);
            cellM.placedNum = residualCageBuilder.new().sum;
            ctx.recentlySolvedCellModels = [ cellM ];
            strategy.executeAnother(ReduceCageNumOptsBySolvedCellsStrategy);
        }
        residualCageBuilder.setIsInput(model.isDerivedFromInputCage(residualCageBuilder.cells));

        ctx.cageSlicer.addAndSliceResidualCageRecursively(residualCageBuilder.new());
    }
}
