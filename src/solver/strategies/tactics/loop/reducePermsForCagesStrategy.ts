import { NumsReduction } from '../../numsReduction';
import { Strategy } from '../../strategy';

export class ReducePermsForCagesStrategy extends Strategy {

    execute() {
        do {
            const reduction = new NumsReduction();

            for (const cageM of this._context.reduction.impactedCageModels) {
                cageM.reduce(this._context.reduction, reduction);
            }

            this._context.resetReduction(reduction);
        } while (this._context.reduction.isNotEmpty);
    }

}
