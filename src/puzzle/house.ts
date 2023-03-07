import * as _ from 'lodash';
import { CachedNumRanges } from '../solver/math/cachedNumRanges';
import { CellProvider, CellsIterator } from './cellsIterator';
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
 * @public
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 */
export class House {

    /**
     * Amount of `House`s of one type (`Row`s, `Column`s or `Nonet`s) within a `Grid`.
     */
    static readonly COUNT = 9;

    /**
     * Range as a readonly array of numbers from 0 to 8 to represent iteration over `House`s of one type
     * (`Row`s, `Column`s or `Nonet`s) within a `Grid`.
     */
    static readonly COUNT_RANGE = CachedNumRanges.ZERO_TO_N_LTE_81[this.COUNT];

    /**
     * Amount of {@link Cell}s in a `House`.
     */
    static readonly CELL_COUNT = 9;

    /**
     * Sum of all numbers in a `House`.
     */
    static readonly SUM = 45;

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Constructs new iterator over {@link Cell}s for a `House` with the given {@link CellProvider}
     * guaranteeing that amount of iterations matches amount of `Cell`s in a `House`.
     *
     * @param cellProvider - Function which provides `Cell` by its index within the `House`.
     *
     * @returns new iterator over {@link Cell}s for a `House` with the given {@link CellProvider}.
     */
    static newCellsIterator(cellProvider: CellProvider) {
        return new CellsIterator(cellProvider, this.CELL_COUNT);
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
