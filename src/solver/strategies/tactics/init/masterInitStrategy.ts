// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Puzzle } from '../../../../puzzle/puzzle';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Context } from '../../context';
import { Strategy } from '../../strategy';
import { FindCombosForHouseCagesStrategy } from './findCombosForHouseCagesStrategy';
import { FindComplementingCagesStrategy } from './findComplementingCagesStrategy';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FindProtrusiveCagesStrategy } from './findProtrusiveCagesStrategy';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DeepTryOptionsStrategy } from '../loop/deepTryOptionsStrategy';

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
            // [performance] Disabling `FindProtrusiveCagesStrategy` as real-world test runs
            // showed that overall solving is slowed down by up to 20% without producing significant hints.
            //
            // this.executeAnother(FindProtrusiveCagesStrategy);

            // Find _complementing_ `Cage`s for `Row`, `Column`, and `Nonet` areas.
            this.executeAnother(FindComplementingCagesStrategy);

            //
            // Analyses possible permutations of number `Combo`s for `Cage`s within each `House`
            // and initializes each `Cage` with respective `Combo`s.
            //
            // `FindCombosForHouseCagesStrategy` must run after `FindComplementingCagesStrategy`
            // so that each `House` will have `Cage`s that cover the entire `House` area
            // since it is necessary for `Combo`s enumeration.
            //
            this.executeAnother(FindCombosForHouseCagesStrategy);
        }
    }

}
