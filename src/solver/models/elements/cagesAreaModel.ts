import { ReadonlyCages } from '../../../puzzle/cage';

/**
 * Area of {@link Cage}s within {@link GridAreaModel}.
 *
 * @public
 */
export interface CagesAreaModel {

    /**
     * _Non-overlapping_ {@link Cage}s within {@link GridAreaModel} which are a part of this area.
     */
    readonly cages: ReadonlyCages;

    /**
     * Amount of {@link Cell}s in all _non-overlapping_ {@link cages} within this area.
     */
    readonly cellCount: number;

}
