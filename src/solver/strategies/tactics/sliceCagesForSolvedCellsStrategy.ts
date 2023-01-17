import { Cage } from '../../../puzzle/cage';
import { Context } from '../context';

export function sliceCagesForSolvedCellsStrategy(this: Context) {
    this.recentlySolvedCellModels.forEach(cellModel => {
        const withinCageModelsSet = cellModel.withinCageModels;
        if (!(withinCageModelsSet.size === 1 && withinCageModelsSet.values().next().value.positioningFlags.isSingleCellCage)) {
            const firstChunkCage = Cage.ofSum(cellModel.placedNum as number).at(cellModel.cell.row, cellModel.cell.col).mk();
            this.cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
        }
    });
}
