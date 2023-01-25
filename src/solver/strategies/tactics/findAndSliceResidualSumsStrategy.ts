import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { CagesAreaModel } from '../../models/elements/cagesAreaModel';
import { Context } from '../context';
import { Strategy } from '../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';

export class FindAndSliceResidualSumsStrategy extends Strategy {
    execute() {
        _.range(1, 5).reverse().forEach((n: number) => {
            _.range(House.CELL_COUNT - n + 1).forEach((leftIndex: number) => {
                doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this._context, n, leftIndex, (cageM: CageModel, rightIndexExclusive: number) => {
                    return cageM.minRow >= leftIndex && cageM.maxRow < rightIndexExclusive;
                }, (row: number) => {
                    return this._model.rowModels[row].cellsIterator();
                }, this);
            });
        });
        _.range(1, 5).reverse().forEach(n => {
            _.range(House.CELL_COUNT - n + 1).forEach((leftIndex: number) => {
                doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this._context, n, leftIndex, (cageM: CageModel, rightIndexExclusive: number) => {
                    return cageM.minCol >= leftIndex && cageM.maxCol < rightIndexExclusive;
                }, (col: number) => {
                    return this._model.columnModels[col].cellsIterator();
                }, this);
            });
        });
        _.range(House.CELL_COUNT).forEach((leftIndex: number) => {
            doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this._context, 1, leftIndex, (cageM: CageModel) => {
                return cageM.positioningFlags.isWithinNonet && cageM.cage.cells[0].nonet === leftIndex;
            }, (nonet: number) => {
                return this._model.nonetModels[nonet].cellsIterator();
            }, this);
        });
    }
}

function doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(ctx: Context, n: number, leftIndex: number, withinHouseFn: (cageM: CageModel, rightIndexExclusive: number) => boolean, cellIteratorFn: (index: number) => Iterable<Cell>, strategy: Strategy) {
    const nHouseCellCount = n * House.CELL_COUNT;
    const nHouseSum = n * House.SUM;

    const rightIndexExclusive = leftIndex + n;
    let cages = new Array<Cage>();
    for (const cageM of ctx.model.cageModelsMap.values()) {
        if (withinHouseFn(cageM, rightIndexExclusive)) {
            cages = cages.concat(cageM.cage);
        }
    }
    const cagesAreaModel = new CagesAreaModel(cages, nHouseCellCount);
    const sum = nHouseSum - cagesAreaModel.sum;
    if ((n === 1 || cagesAreaModel.nonOverlappingCellsSet.size > nHouseCellCount - 6) && sum) {
        const residualCageBuilder = Cage.ofSum(sum);
        _.range(leftIndex, rightIndexExclusive).forEach(index => {
            for (const { row, col } of cellIteratorFn(index)) {
                if (!cagesAreaModel.hasNonOverlapping(ctx.model.cellAt(row, col))) {
                    residualCageBuilder.cell(ctx.model.cellAt(row, col));
                }
            }
        });
        if (residualCageBuilder.cellCount == 1) {
            const cellM = ctx.model.cellModelOf(residualCageBuilder.cells[0]);
            cellM.placedNum = residualCageBuilder.mk().sum;
            ctx.recentlySolvedCellModels = [ cellM ];
            strategy.executeAnother(ReduceCageNumOptsBySolvedCellsStrategy);
        }
        
        ctx.cageSlicer.addAndSliceResidualCageRecursively(residualCageBuilder.mk());
    }
}
