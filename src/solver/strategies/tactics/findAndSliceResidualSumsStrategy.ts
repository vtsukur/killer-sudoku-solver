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
        _.range(House.SIZE - n + 1).forEach((leftIndex: number) => {
            doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, n, leftIndex, (cageModel: CageModel, rightIndexExclusive: number) => {
                return cageModel.minRow >= leftIndex && cageModel.maxRow < rightIndexExclusive;
            }, (row: number) => {
                return this.model.rowModels[row].cellsIterator();
            });
        });
    });
    _.range(1, 5).reverse().forEach(n => {
        _.range(House.SIZE - n + 1).forEach((leftIndex: number) => {
            doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, n, leftIndex, (cageModel: CageModel, rightIndexExclusive: number) => {
                return cageModel.minCol >= leftIndex && cageModel.maxCol < rightIndexExclusive;
            }, (col: number) => {
                return this.model.columnModels[col].cellsIterator();
            });
        });
    });
    _.range(House.SIZE).forEach((leftIndex: number) => {
        doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, 1, leftIndex, (cageModel: CageModel) => {
            return cageModel.positioningFlags.isWithinNonet && cageModel.cage.cells[0].nonet === leftIndex;
        }, (nonet: number) => {
            return this.model.nonetModels[nonet].cellsIterator();
        });
    });
}

function doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(ctx: Context, n: number, leftIndex: number, withinHouseFn: (cageModel: CageModel, rightIndexExclusive: number) => boolean, cellIteratorFn: (index: number) => Iterable<Cell>) {
    const nHouseCellCount = n * House.SIZE;
    const nHouseSum = n * House.SUM;

    const rightIndexExclusive = leftIndex + n;
    let cages = new Array<Cage>();
    for (const cageModel of ctx.model.cageModelsMap.values()) {
        if (withinHouseFn(cageModel, rightIndexExclusive)) {
            cages = cages.concat(cageModel.cage);
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
            ctx.run(reduceCageNumOptsBySolvedCellsStrategy);
        }
        
        ctx.cageSlicer.addAndSliceResidualCageRecursively(residualCageBuilder.mk());
    }
}
