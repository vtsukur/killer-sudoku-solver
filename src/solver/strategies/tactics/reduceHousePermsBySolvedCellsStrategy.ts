import { CageModel } from '../../models/elements/cageModel';
import { Context } from '../context';

export function reduceHousePermsBySolvedCellsStrategy(this: Context) {
    let cageModelsToReduceSet = new Set<CageModel>();

    this.recentlySolvedCellModels.forEach(cellModel => {
        const num = cellModel.placedNum as number;
        [
            this.model.rowModels[cellModel.cell.row],
            this.model.columnModels[cellModel.cell.col],
            this.model.nonetModels[cellModel.cell.nonet]
        ].forEach(houseModel => {
            for (const { row, col } of houseModel.cellsIterator()) {
                if (row === cellModel.cell.row && col === cellModel.cell.col) continue;
    
                const aCellModel = this.model.cellModelAt(row, col);
                if (aCellModel.hasNumOpt(num)) {
                    aCellModel.deleteNumOpt(num);
                    cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...aCellModel.withinCageModels]);
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
