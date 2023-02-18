import { Cage } from '../../../puzzle/cage';
import { Strategy } from '../strategy';

export class SliceCagesForSolvedCellsStrategy extends Strategy {

    execute() {
        this._context.recentlySolvedCellModels.forEach(cellM => {
            const withinCageMsSet = cellM.withinCageModels;
            if (!(withinCageMsSet.size === 1 && withinCageMsSet.values().next().value.positioningFlags.isSingleCellCage)) {
                const firstChunkCage = Cage.ofSum(cellM.placedNum as number).at(cellM.cell.row, cellM.cell.col).new();
                this._context.cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
            }
        });
    }

}
