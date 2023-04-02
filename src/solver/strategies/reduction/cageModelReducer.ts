// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Combo } from '../../math';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CageModel } from '../../models/elements/cageModel';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CellModel } from '../../models/elements/cellModel';
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
