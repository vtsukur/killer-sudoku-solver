import { ReducedCellModels } from '../reducedCellModels';
import { Strategy } from '../strategy';

export class ReducePermsInCagesStrategy extends Strategy {
    execute() {
        do {    
            const reducedCellMs = new ReducedCellModels();
            for (const cageM of this._context.cageModelsToTryReduceFor) {
                const reducedCellMsSet = cageM.reduce();
                reducedCellMs.add(reducedCellMsSet);
            }
    
            this._context.cageModelsToTryReduceFor = Array.from(reducedCellMs.cageModelsToReduce);
        } while (this._context.hasCageModelsToTryReduceFor);
    }    
}
