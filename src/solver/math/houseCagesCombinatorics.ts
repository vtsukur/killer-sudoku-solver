import { ReadonlyCombos } from './combo';

/**
 * {@link Combo}s of nonrepeating numbers which add up to respective `Cage`s' sums.
 *
 * Each value in this array is a readonly array of {@link Combo}s for respective `Cage`.
 *
 * @public
 */
export type CagesCombos = ReadonlyArray<ReadonlyCombos>;

/**
 * Combinatorics of {@link Cage}s in the {@link House}.
 *
 * Implementation of this interface should use Killer Sudoku constraint
 * (_which state that a `House` has nonrepeating set of {@link Cell}`s with numbers from 1 to 9_)
 * to produce nonrepeating {@link Combo}s for each `Cage`.
 *
 * @public
 */
export interface HouseCagesCombinatorics {

    /**
     * Computed {@link Combo}s of nonrepeating numbers which add up to respective `Cage`s' sums.
     *
     * Each value in this array is a readonly array of {@link Combo}s for respective `Cage`.
     * These arrays appear in the same order as respective `Cage`s
     * in `houseCagesAreaModel` input of `compute*` method of specific `Combinatorics` implementation,
     * meaning `Cage` with index `i` in `houseCagesAreaModel` input
     * will be mapped to the array element of `Combo`s with index `i`.
     *
     * Numbers in each `Cage` `Combo` are guaranteed to be nonrepeating
     * following Killer Sudoku constraint of `House` having nonrepeating set of {@link Cell}`s with numbers from 1 to 9.
     */
    readonly combos: CagesCombos;
}
