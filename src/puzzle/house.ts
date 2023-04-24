import * as _ from 'lodash';
import { CachedNumRanges } from '../util/cachedNumRanges';
import { InvalidPuzzleDefError } from './invalidPuzzleDefError';

/**
 * Index of a `House` (`Row`, `Column` or `Nonet`) represented as a number between 0 and 8 (inclusive).
 */
export type HouseIndex = number | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Supportive class for Killer Sudoku `House` (generalization over `Row`, `Column` and `Nonet`)
 * which holds useful constants that describe mathematical properties of any `House`
 * as well as utility methods that simplify iteration over `House` {@link Cell}s.
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 *
 * @public
 */
export class House {

    /**
     * Amount of `House`s of one type (`Row`s, `Column`s or `Nonet`s) within a `Grid`.
     */
    static readonly COUNT = 9;

    /**
     * Readonly array of numbers in the range `[0, {@link House.COUNT}})`
     * to represent iteration over {@link House}`s of one type
     * (`Row`s, `Column`s or `Nonet`s) within a `Grid`
     * or iteration over {@link Cell}s within the {@link House}.
     */
    static readonly INDICES = CachedNumRanges.ZERO_TO_N_LTE_81[this.COUNT];

    /**
     * Amount of {@link Cell}s in a `House`.
     */
    static readonly CELL_COUNT = 9;

    /**
     * Integer next to the amount of {@link Cell}s in a `House`,
     * which is convenient for use in the ranges as the exclusive upper bound.
     */
    static readonly CELL_COUNT_RANGE_INCSLUSIVE_UPPER_BOUND = this.CELL_COUNT + 1;

    /**
     * Sum of all numbers in a `House`.
     */
    static readonly SUM = 45;

    /**
     * Integer next to the sum of all numbers in a `House`,
     * which is convenient for use in the ranges as the exclusive upper bound.
     */
    static readonly SUM_PLUS_1 = this.SUM + 1;

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Validates {@link House} index to be within the possible range of `[0, {@link House.COUNT}})`.
     *
     * @throws {InvalidPuzzleDefError} If {@link House} index is outside of the possible range of `[0, {@link House.COUNT}})`.
     */
    static validateIndex(val: HouseIndex) {
        if (!_.inRange(val, 0, this.CELL_COUNT)) {
            throw new InvalidPuzzleDefError(`Invalid House. Index outside of range. Expected to be within [0, ${this.CELL_COUNT}). Actual: ${val}`);
        }
    }

}
