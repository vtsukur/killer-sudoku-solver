import { CageModel } from '../../models/elements/cageModel';
import { ReducedCellModels } from '../reducedCellModels';
import { Strategy } from '../strategy';

export class ReducePermsInCagesStrategy extends Strategy {
    execute() {
        do {    
            const reducedModels = new ReducedCellModels();
            for (const cageM of this._context.cageModelsToReevaluatePerms as Array<CageModel>) {
                const reducedCellMs = cageM.reduce();
                reducedModels.addCellModels(reducedCellMs);
            }
    
            this._context.cageModelsToReevaluatePerms = Array.from(reducedModels.cageModelsToReduce);
        } while (this._context.hasModelsTouchedByReduction);
    }    
}
