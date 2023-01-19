import { Cage } from '../../../puzzle/cage';
import { Context } from '../context';

export function sliceCagesForSolvedCellsStrategy(this: Context) {
    this.recentlySolvedCellModels.forEach(cellM => {
        const withinCageMsSet = cellM.withinCageModels;
        if (!(withinCageMsSet.size === 1 && withinCageMsSet.values().next().value.positioningFlags.isSingleCellCage)) {
            const firstChunkCage = Cage.ofSum(cellM.placedNum as number).at(cellM.cell.row, cellM.cell.col).mk();
            this.cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
        }
    });
}
