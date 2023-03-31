import { Strategy } from '../../strategy';

export class ReducePermsForCagesStrategy extends Strategy {

    execute() {
        const reduction = this._context.reduction;
        let cageM = reduction.peek();
        while (cageM) {
            cageM.reduce(reduction, reduction);
            cageM = reduction.peek();
        }
    }

}
