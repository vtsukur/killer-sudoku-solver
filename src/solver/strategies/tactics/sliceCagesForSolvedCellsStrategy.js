import { Cage } from '../../../problem/cage';
import { BaseStrategy } from '../baseStrategy';

export class SliceCagesForSolvedCellsStrategy extends BaseStrategy {
    #cageSlicer;
    #solvedCellModels;

    constructor(cageSlicer, solvedCellModels) {
        super();
        this.#cageSlicer = cageSlicer;
        this.#solvedCellModels = solvedCellModels;
    }

    apply() {
        this.#solvedCellModels.forEach(cellModel => {
            const withinCageModelsSet = cellModel.withinCageModels;
            if (!(withinCageModelsSet.size === 1 && withinCageModelsSet.values().next().value.isSingleCellCage)) {
                const firstChunkCage = Cage.ofSum(cellModel.placedNum).at(cellModel.cell.row, cellModel.cell.col).mk();
                this.#cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
            }
        });
    }
}
