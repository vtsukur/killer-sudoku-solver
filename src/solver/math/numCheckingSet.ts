import * as _ from 'lodash';
import { Numbers } from '../../puzzle/numbers';
import { BitStore32, ReadonlyCheckingSet } from './readonlyCheckingSet';

/**
 * Checking set of Sudoku numbers between 1 and 9 with efficient storage & fast checking/manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the numbers outside of the Sudoku range (>9).
 *
 * @public
 */
export interface ReadonlyNumCheckingSet extends ReadonlyCheckingSet<ReadonlyNumCheckingSet> {

    /**
     * Returns copy of the bit storage used for efficient checking/manipulation of the checking numbers set.
     */
    get bitStore(): BitStore32;

    /**
     * Checks if this set has ALL numbers from another checking set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this checking set has ALL numbers from another checking set; otherwise `false`.
     *
     * @see {ReadonlyCheckingSet.hasAll}
     */
    hasAll(val: ReadonlyNumCheckingSet): boolean;

    /**
     * Checks if this set does NOT have any numbers from another checking set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this checking set does NOT have any numbers from another checking set; otherwise `false`.
     *
     * @see {ReadonlyCheckingSet.doesNotHaveAny}
     */
    doesNotHaveAny(val: ReadonlyNumCheckingSet): boolean;

    /**
     * Returns new checking set with Sudoku numbers which are NOT present in the current checking set.
     *
     * For example, if a checking set has numbers [1, 2, 5, 9] then
     * the remaining checking set of numbers will be [3, 4, 6, 7, 8].
     *
     * @returns new checking set with Sudoku numbers which are NOT present in the current checking set.
     */
    remaining(): ReadonlyNumCheckingSet;
}

/**
 * Extends {@link ReadonlyNumCheckingSet} with efficient storage & fast checking/manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * @see {ReadonlyNumCheckingSet}
 *
 * @public
 */
export class NumCheckingSet implements ReadonlyNumCheckingSet {
    private _bitStore = 0;

    private static readonly ALL_NUMBERS_BINARY_STORAGE = (() => {
        let val = 0;
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            val |= 1 << num;
        });
        return val;
    })();

    /**
     * Constructs new checking set from the unique numbers in the given array or from the raw {@link BitStore32}.
     *
     * In case array is specified, only unique numbers are added to the checking set.
     * Number duplicates are silently ignored.
     *
     * Checking set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers or raw {@link BitStore32} to construct this checking set from.
     */
    constructor(val?: ReadonlyArray<number> | BitStore32) {
        if (typeof(val) === 'number') {
            this._bitStore = val;
        } else if (val instanceof Array) {
            for (const num of val) {
                this._bitStore |= 1 << num;
            }
        }
    }

    /**
     * Constructs new checking set from the unique numbers specified via rest parameters.
     *
     * Only unique numbers are added to the checking set. Number duplicates are silently ignored.
     *
     * Checking set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers to construct this checking set from.
     *
     * @returns new checking set from the given numbers.
     */
    static of(...val: ReadonlyArray<number>) {
        return new NumCheckingSet(val);
    }

    /**
     * @see {ReadonlyNumCheckingSet.bitStore}
     */
    get bitStore() {
        return this._bitStore;
    }

    /**
     * @see {ReadonlyNumCheckingSet.hasAll}
     */
    hasAll(val: ReadonlyNumCheckingSet) {
        return (this._bitStore & val.bitStore) === val.bitStore;
    }

    /**
     * @see {ReadonlyNumCheckingSet.doesNotHaveAny}
     */
    doesNotHaveAny(val: ReadonlyNumCheckingSet) {
        return (this._bitStore & val.bitStore) === 0;
    }

    /**
     * @see {ReadonlyNumCheckingSet.remaining}
     */
    remaining(): ReadonlyNumCheckingSet {
        return new NumCheckingSet(NumCheckingSet.ALL_NUMBERS_BINARY_STORAGE ^ this._bitStore);
    }

    /**
     * Adds all numbers from another checking set to this checking set.
     *
     * This method changes this checking set and does NOT modify `val` checking set.
     *
     * Only the numbers which are NOT yet present in this checking set are added.
     * Duplicate numbers are ignored.
     *
     * @param val - Another checking set containing numbers to add to this set.
     */
    add(val: ReadonlyNumCheckingSet) {
        this._bitStore |= val.bitStore;
    }

    /**
     * Removes all numbers present in another checking set from this checking set.
     *
     * This method changes this checking set and does NOT modify `val` checking set.
     *
     * Only the numbers which are present in this checking set are removed.
     * Missing numbers are ignored.
     *
     * @param val - Another checking set containing numbers to remove from this checking set.
     */
    remove(val: ReadonlyNumCheckingSet) {
        this._bitStore &= ~val.bitStore;
    }
}
