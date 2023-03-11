// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Puzzle } from '../../../../puzzle/puzzle';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Context } from '../../context';
import { Strategy } from '../../strategy';
import { FindCombosForHouseCagesStrategy } from './findCombosForHouseCagesStrategy';
import { FindComplementingCagesStrategy } from './findComplementingCagesStrategy';
import { FindProtrusiveCagesStrategy } from './findProtrusiveCagesStrategy';
import { InstructToReduceAllCagesStrategy } from './instructToReduceAllCagesStrategy';

/**
 * {@link Strategy} for solving the Killer Sudoku {@link Puzzle}
 * which executes a group of several {@link Strategy}-ies
 * so it is applied just once on the particular {@link Puzzle}.
 *
 * No {@link Strategy}-ies are executed if {@link Context.skipInit} is set to `true`.
 *
 * @public
 *
 * @see FindProtrusiveCagesStrategy
 * @see FindComplementingCagesStrategy
 * @see FindCombosForHouseCagesStrategy
 * @see InstructToReduceAllCagesStrategy
 */
export class MasterInitStrategy extends Strategy {

    /**
     * @see Strategy.execute
     */
    execute() {
        if (!this._context.skipInit) {
            this.executeAnother(FindProtrusiveCagesStrategy);
            this.executeAnother(FindComplementingCagesStrategy);
            this.executeAnother(FindCombosForHouseCagesStrategy);
            this.executeAnother(InstructToReduceAllCagesStrategy);
        }
    }

}
