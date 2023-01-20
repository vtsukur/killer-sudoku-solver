import { CageModel } from '../../models/elements/cageModel';
import { ReducedCellModels } from '../reducedCellModels';
import { Strategy } from '../strategy';

export class ReducePermsInCagesStrategy extends Strategy {
    execute() {
        do {    
            const reducedCellMs = new ReducedCellModels();
            for (const cageM of this._context.cageModelsToReevaluatePerms as Array<CageModel>) {
                const reducedCellMsSet = cageM.reduce();
                reducedCellMs.addCellModels(reducedCellMsSet);
            }
    
            this._context.cageModelsToReevaluatePerms = Array.from(reducedCellMs.cageModelsToReduce);
        } while (this._context.hasModelsTouchedByReduction);
    }    
}
