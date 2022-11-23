import { Cage } from '../../../problem/cage';
import { CageSlicer } from '../../transform/cageSlicer';
import { BaseStrategy } from '../baseStrategy';

export class SliceCagesForSolvedCellsStrategy extends BaseStrategy {
    #cageSlicer;
    #solvedCellSolvers;

    constructor(model, solvedCellSolvers) {
        super(model);
        this.#cageSlicer = new CageSlicer(model);
        this.#solvedCellSolvers = solvedCellSolvers;
    }

    apply() {
        this.#solvedCellSolvers.forEach(cellModel => {
            const withinCageModelsSet = cellModel.withinCageModels;
            if (!(withinCageModelsSet.size === 1 && withinCageModelsSet.values().next().value.isSingleCellCage)) {
                const firstChunkCage = Cage.ofSum(cellModel.placedNum).at(cellModel.cell.row, cellModel.cell.col).mk();
                this.#cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
            }
        });
    }
}
