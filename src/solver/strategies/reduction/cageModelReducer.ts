import { MasterModelReduction } from './masterModelReduction';

/**
 * Reduces possible numbers for {@link CellModel}s within a {@link CageModel}
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export interface CageModelReducer {

    /**
     * Reduces possible numbers for {@link CellModel}s
     * by checking the validity of numbers' option given possible {@link Combo}s for the {@link CageModel}.
     *
     * @param reduction - {@link MasterModelReduction} that tracks deleted number options.
     */
    reduce(reduction: MasterModelReduction): void;

}
