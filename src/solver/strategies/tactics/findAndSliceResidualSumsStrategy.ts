import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { CagesAreaModel } from '../../models/elements/cagesAreaModel';
import { Context } from '../context';
import { reduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';

export function findAndSliceResidualSumsStrategy(this: Context) {
    _.range(1, 5).reverse().forEach((n: number) => {
        _.range(House.SIZE - n + 1).forEach((leftIdx: number) => {
            doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, n, leftIdx, (cageModel: CageModel, rightIdxExclusive: number) => {
                return cageModel.minRow >= leftIdx && cageModel.maxRow < rightIdxExclusive;
            }, (row: number) => {
                return this.model.rowModels[row].cellsIterator();
            });
        });
    });
    _.range(1, 5).reverse().forEach(n => {
        _.range(House.SIZE - n + 1).forEach((leftIdx: number) => {
            doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, n, leftIdx, (cageModel: CageModel, rightIdxExclusive: number) => {
                return cageModel.minCol >= leftIdx && cageModel.maxCol < rightIdxExclusive;
            }, (col: number) => {
                return this.model.columnModels[col].cellsIterator();
            });
        });
    });
    _.range(House.SIZE).forEach((leftIdx: number) => {
        doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, 1, leftIdx, (cageModel: CageModel) => {
            return cageModel.positioningFlags.isWithinNonet && cageModel.cage.cells[0].nonet === leftIdx;
        }, (nonet: number) => {
            return this.model.nonetModels[nonet].cellsIterator();
        });
    });
}

function doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(ctx: Context, n: number, leftIdx: number, withinHouseFn: (cageModel: CageModel, rightIdxExclusive: number) => boolean, cellIteratorFn: (idx: number) => Iterable<Cell>) {
    const nHouseCellCount = n * House.SIZE;
    const nHouseSum = n * House.SUM;

    const rightIdxExclusive = leftIdx + n;
    let cages = new Array<Cage>();
    for (const cageModel of ctx.model.cageModelsMap.values()) {
        if (withinHouseFn(cageModel, rightIdxExclusive)) {
            cages = cages.concat(cageModel.cage);
        }
    }
    const cagesAreaModel = new CagesAreaModel(cages, nHouseCellCount);
    const sum = nHouseSum - cagesAreaModel.sum;
    if ((n === 1 || cagesAreaModel.nonOverlappingCellsSet.size > nHouseCellCount - 6) && sum) {
        const residualCageBuilder = Cage.ofSum(sum);
        _.range(leftIdx, rightIdxExclusive).forEach(idx => {
            for (const { row, col } of cellIteratorFn(idx)) {
                if (!cagesAreaModel.hasNonOverlapping(ctx.model.cellAt(row, col))) {
                    residualCageBuilder.cell(ctx.model.cellAt(row, col));
                }
            }
        });
        if (residualCageBuilder.cellCount == 1) {
            const cellM = ctx.model.cellModelOf(residualCageBuilder.cells[0]);
            cellM.placedNum = residualCageBuilder.mk().sum;
            ctx.recentlySolvedCellModels = [ cellM ];
            ctx.run(reduceCageNumOptsBySolvedCellsStrategy);
        }
        
        ctx.cageSlicer.addAndSliceResidualCageRecursively(residualCageBuilder.mk());
    }
}
