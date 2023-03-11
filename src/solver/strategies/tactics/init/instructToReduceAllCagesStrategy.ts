import { Strategy } from '../../strategy';

export class InstructToReduceAllCagesStrategy extends Strategy {

    /**
     * @see Strategy.execute
     */
    execute() {
        this._context.setCageModelsToReduceToAll();
    }

}
