import { Cage } from '../../../puzzle/cage';

export function sliceCagesForSolvedCellsStrategy() {
    this.recentlySolvedCellModels.forEach(cellModel => {
        const withinCageModelsSet = cellModel.withinCageModels;
        if (!(withinCageModelsSet.size === 1 && withinCageModelsSet.values().next().value.positioningFlags.isSingleCellCage)) {
            const firstChunkCage = Cage.ofSum(cellModel.placedNum).at(cellModel.cell.row, cellModel.cell.col).mk();
            this.cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
        }
    });
}
