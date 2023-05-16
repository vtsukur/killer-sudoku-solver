// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Combo } from '../../math';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CageModel } from '../../models/elements/cageModel';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CellModel } from '../../models/elements/cellModel';
import { MasterModelReduction } from './masterModelReduction';

/**
 * Reduces _possible numbers_ for {@link CellModel}s within a {@link CageModel}
 * by checking the validity of _currently possible numbers_
 * given _possible {@link Combo}s_ for the {@link CageModel}.
 *
 * @public
 */
export interface CageModelReducer {

    /**
     * Reduces _possible numbers_ for {@link CellModel}s
     * by checking the validity of _currently possible numbers_
     * given _possible {@link Combo}s_ for the {@link CageModel}.
     *
     * @param reduction - {@link MasterModelReduction} that tracks reduction state.
     */
    reduce(reduction: MasterModelReduction): void;

}
