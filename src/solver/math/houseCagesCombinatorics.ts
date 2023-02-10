// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { House } from '../../puzzle/house';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Combo, ReadonlyCombos } from './combo';

/**
 * Readonly array of unique {@link Combo}s of nonrepeating numbers which add up to respective {@link Cage}'s sum.
 *
 * @public
 */
export type CageCombos = ReadonlyCombos;

/**
 * Readonly array of {@link CageCombos} for multiple {@link Cage}s.
 *
 * @public
 */
export type CagesCombos = ReadonlyArray<CageCombos>;

/**
 * Combinatorics of possible {@link Cage}s' numbers within the {@link House}.
 *
 * Implementation of this interface should follow Killer Sudoku constraint,
 * which states that _a {@link House} has nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * @public
 */
export interface HouseCagesCombinatorics {

    /**
     * Possible {@link Cage}s' numbers within the {@link House} in the form as {@link CagesCombos}.
     *
     * Numbers in each {@link Combo} are enumerated so that they add up to {@link Cage} sum.
     *
     * Each value in this array is a readonly array of unique {@link Combo}s
     * of nonrepeating numbers for respective `{@link Cage}.
     * These arrays appear in the same order as respective {@link Cage}s
     * in `houseCagesAreaModel` input of `compute*` method of specific `Combinatorics` implementation,
     * meaning {@link Cage} with index `i` in `houseCagesAreaModel` input
     * will be mapped to the array element of {@link CageCombos} with index `i`.
     *
     * Numbers in each {@link CageCombos} are guaranteed to be nonrepeating following Killer Sudoku constraint of
     * _a {@link House} having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     */
    readonly combos: CagesCombos;
}
