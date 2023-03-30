import { CombosSet } from '../../sets';
import { NumsReduction } from './numsReduction';

/**
 * Reduces possible numbers for {@link CellModel}s within a {@link CageModel}
 * by checking the validity of numbers' options given possible {@link Combo}s for {@link CageModel}.
 *
 * @public
 */
export interface CageModelReducer {

    /**
     * Reduces possible numbers for {@link CellModel}s
     * by checking the validity of numbers' option given possible {@link Combo}s for {@link CageModel}.
     *
     * @param cageMCombos
     * @param reduction - {@link NumsReduction} that tracks deleted number options.
     */
    reduce(cageMCombos: CombosSet, reduction: NumsReduction): void;

}
