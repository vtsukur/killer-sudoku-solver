import { ReducedCellModels } from '../reducedCellModels';
import { Strategy } from '../strategy';

export class ReducePermsInCagesStrategy extends Strategy {
    execute() {
        do { 
            const reducedCellMs = new ReducedCellModels();

            for (const cageM of this._context.cageModelsToReduce) {
                const reducedCellMsSet = cageM.reduce();
                reducedCellMs.add(reducedCellMsSet);
            }
    
            this._context.setCageModelsToReduceFrom(reducedCellMs);
        } while (this._context.hasCageModelsToReduce);
    }
}
