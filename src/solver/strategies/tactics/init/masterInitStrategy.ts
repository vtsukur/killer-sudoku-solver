// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Puzzle } from '../../../../puzzle/puzzle';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Context } from '../../context';
import { Strategy } from '../../strategy';
import { FindCombosForHouseCagesStrategy } from './findCombosForHouseCagesStrategy';
import { FindComplementingCagesStrategy } from './findComplementingCagesStrategy';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FindProtrusiveCagesStrategy } from './findProtrusiveCagesStrategy';
import { InstructToReduceAllCagesStrategy } from '../instructToReduceAllCagesStrategy';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DeepTryOptionsStrategy } from '../deepTryOptionsStrategy';

/**
 * This {@link Strategy} for solving Killer Sudoku {@link Puzzle}
 * performs initialization actions
 * by applying several tactical _initialization_ {@link Strategy}-ies.
 *
 * _Initialization_ {@link Strategy}-ies are applied at most once
 * at the beginning of solving process for a particular {@link Puzzle}
 * as opposed to _looping_ {@link Strategy}-ies
 * which may execute several times for the same {@link Puzzle}.
 *
 * No initialization happens if {@link Context.skipInit} is set to `true`,
 * which is helpful for recursive problem-solving. See {@link DeepTryOptionsStrategy}.
 *
 * @see FindProtrusiveCagesStrategy
 * @see FindComplementingCagesStrategy
 * @see FindCombosForHouseCagesStrategy
 * @see InstructToReduceAllCagesStrategy
 *
 * @public
 */
export class MasterInitStrategy extends Strategy {

    /**
     * @see Strategy.execute
     */
    execute() {
        if (!this._context.skipInit) {
            //
            // [perf] Disabling `FindProtrusiveCagesStrategy` as real-world test runs
            // showed that overall solving is slowed down by up to 20% without producing significant hints.
            //
            // this.executeAnother(FindProtrusiveCagesStrategy);

            this.executeAnother(FindComplementingCagesStrategy);

            //
            // `FindCombosForHouseCagesStrategy` must run after `FindComplementingCagesStrategy`
            // so that each `House` will have `Cage`s that cover the entire `House` area
            // since it is necessary for `Combo`s enumeration.
            //
            this.executeAnother(FindCombosForHouseCagesStrategy);

            this.executeAnother(InstructToReduceAllCagesStrategy);
        }
    }

}
