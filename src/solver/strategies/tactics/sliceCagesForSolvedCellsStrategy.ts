import { Cage } from '../../../puzzle/cage';
import { Context } from '../context';

export function sliceCagesForSolvedCellsStrategy(this: Context) {
    this.recentlySolvedCellModels.forEach(cellM => {
        const withinCageModelsSet = cellM.withinCageModels;
        if (!(withinCageModelsSet.size === 1 && withinCageModelsSet.values().next().value.positioningFlags.isSingleCellCage)) {
            const firstChunkCage = Cage.ofSum(cellM.placedNum as number).at(cellM.cell.row, cellM.cell.col).mk();
            this.cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
        }
    });
}
