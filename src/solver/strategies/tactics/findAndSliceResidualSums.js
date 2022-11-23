import _ from 'lodash';
import { Cage } from '../../../problem/cage';
import { House } from '../../../problem/house';
import { CagesAreaModel } from '../../models/elements/cagesAreaModel';
import { BaseStrategy } from '../baseStrategy';

export class FindAndSliceResidualSumsStrategy extends BaseStrategy {
    #cageSlicer;

    constructor(cageSlicer) {
        super();
        this.#cageSlicer = cageSlicer;
    }

    apply(ctx) {
        _.range(1, 4).reverse().forEach(n => {
            _.range(House.SIZE - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(ctx.model, n, leftIdx, (cageModel, rightIdxExclusive) => {
                    return cageModel.minRow >= leftIdx && cageModel.maxRow < rightIdxExclusive;
                }, (row) => {
                    return ctx.model.rowModels[row].cellIterator()
                });
            });
        });
        _.range(1, 4).reverse().forEach(n => {
            _.range(House.SIZE - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(ctx.model, n, leftIdx, (cageModel, rightIdxExclusive) => {
                    return cageModel.minCol >= leftIdx && cageModel.maxCol < rightIdxExclusive;
                }, (col) => {
                    return ctx.model.columnModels[col].cellIterator()
                });
            });
        });
        _.range(House.SIZE).forEach(leftIdx => {
            this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(ctx.model, 1, leftIdx, (cageModel) => {
                return cageModel.isWithinNonet && cageModel.cage.cells[0].nonet === leftIdx;
            }, (nonet) => {
                return ctx.model.nonetModels[nonet].cellIterator();
            });
        });
    }

    #doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(model, n, leftIdx, withinHouseFn, cellIteratorFn) {
        const nHouseCellCount = n * House.SIZE;
        const nHouseSum = n * House.SUM;

        const rightIdxExclusive = leftIdx + n;
        let cages = [];
        for (const cageModel of model.cageModelsMap.values()) {
            if (withinHouseFn(cageModel, rightIdxExclusive)) {
                cages = cages.concat(cageModel.cage);
            }
        }
        const cagesAreaModel = new CagesAreaModel(cages, nHouseCellCount);
        if (n === 1 || cagesAreaModel.nonOverlappingCellsSet.size > nHouseCellCount - 6) {
            const residualCells = [];
            _.range(leftIdx, rightIdxExclusive).forEach(idx => {
                for (const { row, col } of cellIteratorFn(idx)) {
                    if (!cagesAreaModel.hasNonOverlapping(model.cellAt(row, col))) {
                        residualCells.push(model.cellAt(row, col));
                    }
                }
            });
            if (residualCells.length) {
                const residualCage = new Cage(nHouseSum - cagesAreaModel.sum, residualCells);
                if (!model.cageModelsMap.has(residualCage.key)) {
                    this.#cageSlicer.addAndSliceResidualCageRecursively(residualCage);                        
                }
            }
        }
    }
}
