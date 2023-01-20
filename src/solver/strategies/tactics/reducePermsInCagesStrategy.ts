import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { Strategy } from '../strategy';

export class ReducePermsInCagesStrategy extends Strategy {
    execute() {
        let iterate = true;
    
        while (iterate) {
            let modifiedCellMs = new Set<CellModel>();
    
            for (const cageM of this._context.cageModelsToReevaluatePerms as Array<CageModel>) {
                const currentlyModifiedCellMs = cageM.reduce();
                modifiedCellMs = new Set([...modifiedCellMs, ...currentlyModifiedCellMs]);
            }
    
            let moreCageMsToReduce = new Set<CageModel>();
            for (const modifiedCellM of modifiedCellMs.values()) {
                moreCageMsToReduce = new Set([...moreCageMsToReduce, ...modifiedCellM.withinCageModels]);
            }
    
            this._context.cageModelsToReevaluatePerms = Array.from(moreCageMsToReduce.values());
            iterate = moreCageMsToReduce.size > 0;
        }
    
        this._context.clearCageModelsToReevaluatePerms();
    }    
}
