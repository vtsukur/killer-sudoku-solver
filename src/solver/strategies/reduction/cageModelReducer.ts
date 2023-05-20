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
 * For example, let's assume we have the {@link CageModel} of sum `11` of size 2
 * with the `Combo` of numbers `[5, 6]` as the only _possible {@link Combo}_.
 * Let's take that the first {@link CellModel} has the possible number `5`,
 * and the second {@link CellModel} has both `5` and `6`.
 * In this case, reduction should happen for the second {@link CellModel}
 * by removing `5` as the _possible number_,
 * effectively hinting that the first {@link CellModel} has the number `5` and
 * the second {@link CellModel} has the number `6`.
 *
 * The {@link MasterModelReduction} object should reflect the reduction action.
 *
 * @public
 */
export interface CageModelReducer {

    /**
     * Reduces _possible numbers_ for {@link CellModel}s
     * by checking the validity of _currently possible numbers_
     * given _possible {@link Combo}s_ for the {@link CageModel}.
     *
     * @param reduction - {@link MasterModelReduction} which should reflect the reduction action.
     */
    reduce(reduction: MasterModelReduction): void;

}
