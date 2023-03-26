import { NumsReduction } from '../../numsReduction';
import { Strategy } from '../../strategy';

export class ReducePermsForCagesStrategy extends Strategy {

    execute() {
        do {
            const reduction = new NumsReduction();

            for (const cageM of this._context.cageModelsToReduce) {
                cageM.reduce(reduction);
            }

            this._context.resetReduction(reduction);
        } while (this._context.hasCageModelsToReduce);
    }

}
