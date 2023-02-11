// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { House } from '../../puzzle/house';
import { HouseCagesAreaModel } from '../models/elements/houseCagesAreaModel';
import { HouseCagesCombinatorics } from './houseCagesCombinatorics';
import { SumAddendsCombinatorics } from './sumAddendsCombinatorics';

/**
 * Combinatorics of possible _overlapping_ {@link Cage}s' numbers within the same {@link House}.
 *
 * {@link Cage}s are considered _overlapping_ if they have one or more {@link Cell}s
 * which are also present in other {@link Cage}s of the same {@link House}.
 *
 * Implementation of this interface should follow Killer Sudoku constraint,
 * which states that _a {@link House} has nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OverlappingHouseCagesCombinatorics extends HouseCagesCombinatorics {}

/**
 * Combinatorics of possible _overlapping_ {@link Cage}s' numbers within the same {@link House}.
 *
 * {@link Cage}s are considered _overlapping_ if they have one or more {@link Cell}s
 * which are also present in other {@link Cage}s of the same {@link House}.
 *
 * Implementation of this interface should follow Killer Sudoku constraint,
 * which states that _a {@link House} has nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * @public
 */
export class OverlappingHouseCagesCombinatorics {

    // istanbul ignore next
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Enumerates possible {@link Cell}s' numbers for the {@link Cage}s within the same {@link House}
     * in the form of {@link HouseCagesCombos} considering {@link Cage}s to be _overlapping_.
     *
     * @param houseCagesAreaModel - {@link HouseCagesAreaModel} with {@link Cage}s having _overlapping_ {@link Cell}s.
     *
     * {@link Cage}s may cover either complete set of {@link House} {@link Cell}s or a subset.
     * Empty {@link HouseCagesAreaModel} is also acceptable.
     *
     * For performance reasons, this method does NOT check:
     *  - if all given {@link Cage}s belong to the same {@link House};
     *  - if {@link Cell}s in the given {@link Cage}s are _overlapping_;
     *  - if total sum of all {@link Cage}s is no greater than {@link House} sum.
     * It's up to the caller to provide valid input.
     *
     * @returns Possible {@link Cell}s' numbers for the {@link Cage}s within the same {@link House}
     * in the form of {@link HouseCagesCombos} considering {@link Cage}s to be _overlapping_.
     *
     * @see {houseCagesCombos}
     */
    static enumerateCombos(houseCagesAreaModel: HouseCagesAreaModel): OverlappingHouseCagesCombinatorics {
        return {
            houseCagesCombos: houseCagesAreaModel.cages.map(cage => {
                return SumAddendsCombinatorics.enumerate(cage.sum, cage.cellCount).val;
            })
        };
    }
}
