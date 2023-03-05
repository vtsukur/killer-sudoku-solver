import { ReadonlyCellIndicesCheckingSet } from '../../math';
import { CagesAreaModel } from './cagesAreaModel';

/**
 * Area of {@link Cage}s within {@link GridAreaModel} which do NOT have shared {@link Cell}s.
 *
 * Such {@link Cage}s are called _non-overlapping_.
 *
 * @public
 */
export interface NonOverlappingCagesAreaModel extends CagesAreaModel {

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
