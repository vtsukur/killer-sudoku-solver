import { NumsReduction } from '../../numsReduction';
import { Strategy } from '../../strategy';

export class ReducePermsForCagesStrategy extends Strategy {

    execute() {
        do {
            const reduction = new NumsReduction();

            for (const cageM of this._context.cageModelsToReduce) {
                const reducedCellMsSet = cageM.reduce();
                reduction.addAll(reducedCellMsSet);
            }

            this._context.setCageModelsToReduceFrom(reduction);
        } while (this._context.hasCageModelsToReduce);
    }

}
