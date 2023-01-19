import { CageModel } from '../../models/elements/cageModel';
import { Context } from '../context';

export function reduceHousePermsBySolvedCellsStrategy(this: Context) {
    let cageModelsToReduceSet = new Set<CageModel>();

    this.recentlySolvedCellModels.forEach(cellM => {
        const num = cellM.placedNum as number;
        [
            this.model.rowModels[cellM.cell.row],
            this.model.columnModels[cellM.cell.col],
            this.model.nonetModels[cellM.cell.nonet]
        ].forEach(houseModel => {
            for (const { row, col } of houseModel.cellsIterator()) {
                if (row === cellM.cell.row && col === cellM.cell.col) continue;
    
                const aCellM = this.model.cellModelAt(row, col);
                if (aCellM.hasNumOpt(num)) {
                    aCellM.deleteNumOpt(num);
                    cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...aCellM.withinCageModels]);
                }
            }    
        });
    });

    if (cageModelsToReduceSet.size > 0) {
        if (this.hasCageModelsToReevaluatePerms) {
            this.cageModelsToReevaluatePerms = Array.from(new Set([...this.cageModelsToReevaluatePerms as Array<CageModel>, ...cageModelsToReduceSet]));
        } else {
            this.cageModelsToReevaluatePerms = Array.from(cageModelsToReduceSet);
        }
    }
}
