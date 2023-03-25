import { NumsReduction } from '../../numsReduction';
import { Strategy } from '../../strategy';

export class ReducePermsForCagesStrategy extends Strategy {

    execute() {
        do {
            const reducedCellMs = new NumsReduction();

            for (const cageM of this._context.cageModelsToReduce) {
                const reducedCellMsSet = cageM.reduce();
                reducedCellMs.add(reducedCellMsSet);
            }

            this._context.setCageModelsToReduceFrom(reducedCellMs);
        } while (this._context.hasCageModelsToReduce);
    }

}
