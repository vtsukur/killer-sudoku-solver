import { ReadonlyCages } from '../../../puzzle/cage';
import { ReadonlyCellIndicesCheckingSet } from '../../math';

/**
 * Area of {@link Cage}s within {@link GridAreaModel} which do *not* have shared {@link Cell}s.
 *
 * Such {@link Cage}s are called _non-overlapping_.
 *
 * @public
 */
export interface NonOverlappingCagesAreaModel {

    /**
     * _Non-overlapping_ {@link Cage}s within {@link GridAreaModel} which are a part of this area.
     */
    readonly cages: ReadonlyCages;

    /**
     * Amount of {@link Cell}s in all _non-overlapping_ {@link cages} within this area.
     */
    readonly cellCount: number;

    /**
     * Checking set of {@link Cell} indices which has all
     * {@link Cell}s of _non-overlapping_ {@link cages} within {@link GridAreaModel} included.
     */
    readonly cellIndices: ReadonlyCellIndicesCheckingSet;

    /**
     * Sum of all _non-overlapping_ {@link cages} in this area.
     */
    readonly sum: number;

}
