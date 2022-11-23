import _ from 'lodash';
import { Cage } from '../../../problem/cage';
import { House } from '../../../problem/house';
import { CagesAreaModel } from '../../models/elements/cagesAreaModel';
import { CageSlicer } from '../../transform/cageSlicer';
import { BaseStrategy } from '../baseStrategy';

export class FindAndSliceResidualSumsStrategy extends BaseStrategy {
    #cageSlicer;

    constructor(model) {
        super(model);
        this.#cageSlicer = new CageSlicer(model);
    }

    apply() {
        _.range(1, 4).reverse().forEach(n => {
            _.range(House.SIZE - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, (cageModel, rightIdxExclusive) => {
                    return cageModel.minRow >= leftIdx && cageModel.maxRow < rightIdxExclusive;
                }, (row) => {
                    return this.model.rowModels[row].cellIterator()
                });
            });
        });
        _.range(1, 4).reverse().forEach(n => {
            _.range(House.SIZE - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, (cageModel, rightIdxExclusive) => {
                    return cageModel.minCol >= leftIdx && cageModel.maxCol < rightIdxExclusive;
                }, (col) => {
                    return this.model.columnModels[col].cellIterator()
                });
            });
        });
        _.range(House.SIZE).forEach(leftIdx => {
            this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(1, leftIdx, (cageModel) => {
                return cageModel.isWithinNonet && cageModel.cage.cells[0].nonet === leftIdx;
            }, (nonet) => {
                return this.model.nonetModels[nonet].cellIterator();
            });
        });
    }

    #doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, withinHouseFn, cellIteratorFn) {
        const nHouseCellCount = n * House.SIZE;
        const nHouseSum = n * House.SUM;

        const rightIdxExclusive = leftIdx + n;
        let cages = [];
        for (const cageModel of this.model.cageModelsMap.values()) {
            if (withinHouseFn(cageModel, rightIdxExclusive)) {
                cages = cages.concat(cageModel.cage);
            }
        }
        const cagesAreaModel = new CagesAreaModel(cages, nHouseCellCount);
        if (n === 1 || cagesAreaModel.nonOverlappingCellsSet.size > nHouseCellCount - 6) {
            const residualCells = [];
            _.range(leftIdx, rightIdxExclusive).forEach(idx => {
                for (const { row, col } of cellIteratorFn(idx)) {
                    if (!cagesAreaModel.hasNonOverlapping(this.model.cellAt(row, col))) {
                        residualCells.push(this.model.cellAt(row, col));
                    }
                }
            });
            if (residualCells.length) {
                const residualCage = new Cage(nHouseSum - cagesAreaModel.sum, residualCells);
                if (!this.model.cageModelsMap.has(residualCage.key)) {
                    this.#cageSlicer.addAndSliceResidualCageRecursively(residualCage);                        
                }
            }
        }
    }
}
