import _ from 'lodash';
import { Cage } from '../../../problem/cage';
import { House } from '../../../problem/house';
import { CagesAreaModel } from '../../models/elements/cagesAreaModel';

export function findAndSliceResidualSumsStrategy() {
    _.range(1, 4).reverse().forEach(n => {
        _.range(House.SIZE - n + 1).forEach(leftIdx => {
            doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, n, leftIdx, (cageModel, rightIdxExclusive) => {
                return cageModel.minRow >= leftIdx && cageModel.maxRow < rightIdxExclusive;
            }, (row) => {
                return this.model.rowModels[row].cellIterator()
            });
        });
    });
    _.range(1, 4).reverse().forEach(n => {
        _.range(House.SIZE - n + 1).forEach(leftIdx => {
            doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, n, leftIdx, (cageModel, rightIdxExclusive) => {
                return cageModel.minCol >= leftIdx && cageModel.maxCol < rightIdxExclusive;
            }, (col) => {
                return this.model.columnModels[col].cellIterator()
            });
        });
    });
    _.range(House.SIZE).forEach(leftIdx => {
        doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(this, 1, leftIdx, (cageModel) => {
            return cageModel.isWithinNonet && cageModel.cage.cells[0].nonet === leftIdx;
        }, (nonet) => {
            return this.model.nonetModels[nonet].cellIterator();
        });
    });
};

function doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(ctx, n, leftIdx, withinHouseFn, cellIteratorFn) {
    const nHouseCellCount = n * House.SIZE;
    const nHouseSum = n * House.SUM;

    const rightIdxExclusive = leftIdx + n;
    let cages = [];
    for (const cageModel of ctx.model.cageModelsMap.values()) {
        if (withinHouseFn(cageModel, rightIdxExclusive)) {
            cages = cages.concat(cageModel.cage);
        }
    }
    const cagesAreaModel = new CagesAreaModel(cages, nHouseCellCount);
    if (n === 1 || cagesAreaModel.nonOverlappingCellsSet.size > nHouseCellCount - 6) {
        const residualCells = [];
        _.range(leftIdx, rightIdxExclusive).forEach(idx => {
            for (const { row, col } of cellIteratorFn(idx)) {
                if (!cagesAreaModel.hasNonOverlapping(ctx.model.cellAt(row, col))) {
                    residualCells.push(ctx.model.cellAt(row, col));
                }
            }
        });
        if (residualCells.length) {
            const residualCage = new Cage(nHouseSum - cagesAreaModel.sum, residualCells);
            // if (!ctx.model.cageModelsMap.has(residualCage.key)) {
                ctx.cageSlicer.addAndSliceResidualCageRecursively(residualCage);                        
            // }
        }
    }
}
