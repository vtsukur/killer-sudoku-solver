import { Strategy } from '../strategy';

/**
 * {@link Strategy} for solving the Killer Sudoku {@link Puzzle}
 * which instructs follow-up {@link Strategy}-ies
 * to re-evaluate possible number options for all {@link Cage}s
 * registered in the {@link MasterModel} by applying _reduction_.
 *
 * @public
 */
export class InstructToReduceAllCagesStrategy extends Strategy {

    /**
     * @see Strategy.execute
     */
    execute() {
        this._context.setCageModelsToReduceToAll();
    }

}
