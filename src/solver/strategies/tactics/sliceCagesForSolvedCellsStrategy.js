import { Cage } from '../../../problem/cage';

export function sliceCagesForSolvedCellsStrategy() {
    this.recentlySolvedCellModels.forEach(cellModel => {
        const withinCageModelsSet = cellModel.withinCageModels;
        if (!(withinCageModelsSet.size === 1 && withinCageModelsSet.values().next().value.isSingleCellCage)) {
            const firstChunkCage = Cage.ofSum(cellModel.placedNum).at(cellModel.cell.row, cellModel.cell.col).mk();
            this.cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
        }
    });
}
