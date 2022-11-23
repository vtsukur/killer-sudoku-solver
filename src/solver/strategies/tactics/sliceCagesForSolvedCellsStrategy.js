import { Cage } from '../../../problem/cage';

export const sliceCagesForSolvedCellsStrategy = (ctx) => {
    ctx.recentlySolvedCellModels.forEach(cellModel => {
        const withinCageModelsSet = cellModel.withinCageModels;
        if (!(withinCageModelsSet.size === 1 && withinCageModelsSet.values().next().value.isSingleCellCage)) {
            const firstChunkCage = Cage.ofSum(cellModel.placedNum).at(cellModel.cell.row, cellModel.cell.col).mk();
            ctx.cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
        }
    });
}
