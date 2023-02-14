import * as _ from 'lodash';
import { Numbers } from '../../puzzle/numbers';

/**
 * Binary storage used for efficient manipulation of the {@link NumCheckingSet}.
 *
 * Represented as built-in `number`.
 *
 * @public
 */
export type BinaryStorage = number;

/**
 * Checking set of Sudoku numbers between 1 and 9 with efficient storage & fast checking/manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, this class does NOT do range checks
 * and does NOT guarantee correct work for the numbers outside of Sudoku range (>9).
 * It is NOT applicable for a wide range of use cases.
 *
 * @public
 */
export interface ReadonlyNumCheckingSet {

    /**
     * Returns copy of binary storage used for manipulation operations on this checking set.
     */
    get binaryStorage(): BinaryStorage;

    /**
     * Checks if this set has ALL numbers from another checking set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this checking set has ALL numbers from another checking set; otherwise `false`.
     */
    hasAll(val: ReadonlyNumCheckingSet): boolean;

    /**
     * Checks if this set does NOT have any numbers from another checking set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this checking set does NOT have any numbers from another checking set; otherwise `false`.
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
    private _binaryStorage = 0;

    private static readonly ALL_NUMBERS_BINARY_STORAGE = (function() {
        let val = 0;
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            val |= 1 << num;
        });
        return val;
    })();

    /**
     * Constructs new checking set from the unique numbers in the given array or from raw binary storage value.
     *
     * In case array is specified, only unique numbers are added to the checking set.
     * Number duplicates are silently ignored.
     *
     * Checking set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers to construct this checking set from or raw binary storage value.
     */
    constructor(val?: ReadonlyArray<number> | BinaryStorage) {
        if (typeof(val) === 'number') {
            this._binaryStorage = val;
        } else if (val instanceof Array) {
            for (const num of val) {
                this._binaryStorage |= 1 << num;
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
     * @see {BaseFastNumSet.binaryStorage}
     */
    get binaryStorage() {
        return this._binaryStorage;
    }

    /**
     * @see {ReadonlyNumCheckingSet.hasAll}
     */
    hasAll(val: ReadonlyNumCheckingSet) {
        return (this._binaryStorage & val.binaryStorage) === val.binaryStorage;
    }

    /**
     * @see {ReadonlyNumCheckingSet.doesNotHaveAny}
     */
    doesNotHaveAny(val: ReadonlyNumCheckingSet) {
        return (this._binaryStorage & val.binaryStorage) === 0;
    }

    /**
     * @see {ReadonlyNumCheckingSet.remaining}
     */
    remaining(): ReadonlyNumCheckingSet {
        return new NumCheckingSet(NumCheckingSet.ALL_NUMBERS_BINARY_STORAGE ^ this._binaryStorage);
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
        this._binaryStorage |= val.binaryStorage;
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
        this._binaryStorage &= ~val.binaryStorage;
    }
}
