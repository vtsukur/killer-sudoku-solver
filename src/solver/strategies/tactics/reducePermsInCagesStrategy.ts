import { CageModel } from '../../models/elements/cageModel';
import { ReducedModels } from '../reducedModels';
import { Strategy } from '../strategy';

export class ReducePermsInCagesStrategy extends Strategy {
    execute() {
        let iterate = true;
    
        while (iterate) {
            const reducedModels = new ReducedModels();
    
            for (const cageM of this._context.cageModelsToReevaluatePerms as Array<CageModel>) {
                const reducedCellMs = cageM.reduce();
                reducedModels.addCellModels(reducedCellMs);
            }
    
            this._context.cageModelsToReevaluatePerms = Array.from(reducedModels.cageModels);
            iterate = reducedModels.isNotEmpty;
        }
    
        this._context.clearCageModelsToReevaluatePerms();
    }    
}
