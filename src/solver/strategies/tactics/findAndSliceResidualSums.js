import _ from 'lodash';
import { Cage } from '../../../problem/cage';
import { House } from '../../../problem/house';
import { CagesArea } from '../../cagesArea';
import { CageSlicer } from '../../cageSlicer';
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
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minRow >= leftIdx && cageSolver.maxRow < rightIdxExclusive;
                }, (row) => {
                    return this.model.rowSolvers[row].cellIterator()
                });
            });
        });
        _.range(1, 4).reverse().forEach(n => {
            _.range(House.SIZE - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minCol >= leftIdx && cageSolver.maxCol < rightIdxExclusive;
                }, (col) => {
                    return this.model.columnSolvers[col].cellIterator()
                });
            });
        });
        _.range(House.SIZE).forEach(leftIdx => {
            this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(1, leftIdx, (cageSolver) => {
                return cageSolver.isWithinNonet && cageSolver.cage.cells[0].nonet === leftIdx;
            }, (nonet) => {
                return this.model.nonetSolvers[nonet].cellIterator();
            });
        });
    }

    #doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, withinHouseFn, cellIteratorFn) {
        const nHouseCellCount = n * House.SIZE;
        const nHouseSum = n * House.SUM;

        const rightIdxExclusive = leftIdx + n;
        let cages = [];
        for (const cageSolver of this.model.cagesSolversMap.values()) {
            if (withinHouseFn(cageSolver, rightIdxExclusive)) {
                cages = cages.concat(cageSolver.cage);
            }
        }
        const cagesArea = new CagesArea(cages, nHouseCellCount);
        if (n === 1 || cagesArea.nonOverlappingCellsSet.size > nHouseCellCount - 6) {
            const residualCells = [];
            _.range(leftIdx, rightIdxExclusive).forEach(idx => {
                for (const { row, col } of cellIteratorFn(idx)) {
                    if (!cagesArea.hasNonOverlapping(this.model.cellAt(row, col))) {
                        residualCells.push(this.model.cellAt(row, col));
                    }
                }
            });
            if (residualCells.length) {
                const residualCage = new Cage(nHouseSum - cagesArea.sum, residualCells);
                if (!this.model.cagesSolversMap.has(residualCage.key)) {
                    this.#cageSlicer.addAndSliceResidualCageRecursively(residualCage);                        
                }
            }
        }
    }
}
