import { CageModel } from '../../models/elements/cageModel';
import { Strategy } from '../strategy';

export class ReduceHousePermsBySolvedCellsStrategy extends Strategy {
    execute() {
        let cageMsToReduceSet = new Set<CageModel>();

        this._context.recentlySolvedCellModels.forEach(cellM => {
            const num = cellM.placedNum as number;
            [
                this._model.rowModels[cellM.cell.row],
                this._model.columnModels[cellM.cell.col],
                this._model.nonetModels[cellM.cell.nonet]
            ].forEach(houseM => {
                for (const { row, col } of houseM.cellsIterator()) {
                    if (row === cellM.cell.row && col === cellM.cell.col) continue;
        
                    const aCellM = this._model.cellModelAt(row, col);
                    if (aCellM.hasNumOpt(num)) {
                        aCellM.deleteNumOpt(num);
                        cageMsToReduceSet = new Set([...cageMsToReduceSet, ...aCellM.withinCageModels]);
                    }
                }    
            });
        });
    
        if (cageMsToReduceSet.size > 0) {
            if (this._context.hasCageModelsToTryReduceFor) {
                this._context.cageModelsToTryReduceFor = new Set([...this._context.cageModelsToTryReduceFor, ...cageMsToReduceSet]);
            } else {
                this._context.cageModelsToTryReduceFor = cageMsToReduceSet;
            }
        }
    }
}
