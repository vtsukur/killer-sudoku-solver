import { Strategy } from '../../strategy';
import { FindCombosForHouseCagesStrategy } from './findCombosForHouseCagesStrategy';
import { FindComplementingCagesStrategy } from './findComplementingCagesStrategy';
import { FindProtrusiveCagesStrategy } from './findProtrusiveCagesStrategy';

export class MasterInitStrategy extends Strategy {

    /**
     * @see Strategy.execute
     */
    execute() {
        if (!this._context.skipInit) {
            this.executeAnother(FindProtrusiveCagesStrategy);
            this.executeAnother(FindComplementingCagesStrategy);
            this.executeAnother(FindCombosForHouseCagesStrategy);
        }
    }

}
