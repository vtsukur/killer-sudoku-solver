import { NumsReduction } from '../../reduction/numsReduction';
import { Strategy } from '../../strategy';

export class ReducePermsForCagesStrategy extends Strategy {

    execute() {
        do {
            const reduction = new NumsReduction();

            const cageMsSortedByCellCountAsc = Array.from(this._context.reduction.impactedCageModels);
            cageMsSortedByCellCountAsc.sort((cageMA, cageMB) => cageMA.cellCount - cageMB.cellCount);

            for (const cageM of cageMsSortedByCellCountAsc) {
                cageM.reduce(this._context.reduction, reduction);
            }

            this._context.resetReduction(reduction);
        } while (this._context.reduction.isNotEmpty);
    }

}
