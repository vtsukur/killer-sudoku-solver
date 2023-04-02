import { MasterModelReduction } from '../../reduction/masterModelReduction';
import { Strategy } from '../../strategy';

export class ReducePermsForCagesStrategy extends Strategy {

    execute() {
        const reduction = this._context.reduction;
        let cageM = reduction.peek();
        while (cageM) {
            if (this._model.cageModelsMap.has(cageM.cage.key)) {
                cageM.reduce(reduction, reduction);
            }
            cageM = reduction.peek();
        }
        this._context.reduction = new MasterModelReduction();
    }

}
