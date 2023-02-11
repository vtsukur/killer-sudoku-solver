// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { House } from '../../puzzle/house';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Combo, ReadonlyCombos } from './combo';

/**
 * Readonly array of unique {@link Combo}s of nonrepeating numbers
 * which add up to respective {@link Cage}'s sum within the same {@link House}.
 *
 * @public
 */
export type HouseCageCombos = ReadonlyCombos;

/**
 * Readonly array of {@link HouseCageCombos} for multiple {@link Cage}s in the {@link House}.
 *
 * @public
 */
export type HouseCagesCombos = ReadonlyArray<HouseCageCombos>;

/**
 * Combinatorics of possible {@link Cage}s' numbers within the same {@link House}.
 *
 * Implementation of this interface should follow Killer Sudoku constraint,
 * which states that _a {@link House} has nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * @public
 */
export interface HouseCagesCombinatorics {

    /**
     * Possible {@link Cage}s' numbers within the same {@link House} in the form of {@link HouseCagesCombos}.
     *
     * Each value in this array is a readonly array of unique {@link Combo}s
     * of nonrepeating numbers for respective {@link Cage} represented as {@link HouseCageCombos}.
     *
     * Numbers in each {@link Combo} are enumerated so that they add up to {@link Cage} sum.
     *
     * Each {@link HouseCageCombos} value in this array appears in the same order as respective {@link Cage}s
     * in `houseCagesAreaModel` input of `enumerate*` method of specific `Combinatorics` implementation,
     * meaning {@link Cage} with index `i` in `houseCagesAreaModel` input
     * will be mapped to the array element of {@link HouseCageCombos} with index `i`.
     *
     * Numbers in each {@link HouseCageCombos} are guaranteed to be nonrepeating following Killer Sudoku constraint of
     * _a {@link House} having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     */
    readonly houseCagesCombos: HouseCagesCombos;
}
