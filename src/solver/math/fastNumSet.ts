import * as _ from 'lodash';
import { Numbers } from '../../puzzle/numbers';

interface BaseFastNumSet {
    get binaryStorage(): number;
}

/**
 * Binary storage used for efficient manipulation of the {@link FastNumSet}.
 */
export type BinaryStorage = number;

/**
 * Set of Sudoku numbers between 1 and 9 with extremely fast and efficient lookup operations
 * which leverage bitwise operators on a number.
 *
 * For performance reasons, this class does NOT do range checks
 * and does NOT guarantee correct work for the numbers outside of Sudoku range (>9).
 * It is NOT applicable for a wide range of use cases.
 *
 * @public
 */
export interface ReadonlyFastNumSet extends BaseFastNumSet {

    /**
     * Checks if this set has ALL numbers from another set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this set has ALL numbers from another set; otherwise `false`.
     */
    hasAll(val: ReadonlyFastNumSet): boolean;

    /**
     * Checks if this set does NOT have any numbers from another set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this set does NOT have any numbers from another set; otherwise `false`.
     */
    doesNotHaveAny(val: ReadonlyFastNumSet): boolean;

    /**
     * Returns new set with Sudoku numbers which are NOT present in the current set.
     *
     * For example, if a set has numbers [1, 2, 5, 9] then
     * the remaining set of numbers will be [3, 4, 6, 7, 8].
     *
     * @returns new set with Sudoku numbers which are NOT present in the current set.
     */
    remaining(): ReadonlyFastNumSet;
}

/**
 * Extends {@link ReadonlyFastNumSet} with extremely fast and efficient mutable operations.
 *
 * @see {ReadonlyFastNumSet}
 *
 * @public
 */
export class FastNumSet implements ReadonlyFastNumSet {
    private _binaryStorage = 0;

    private static readonly ALL_NUMBERS_BINARY_STORAGE = (function() {
        let val = 0;
        _.range(Numbers.MIN, Numbers.MAX + 1).forEach(num => {
            val |= 1 << num;
        });
        return val;
    })();

    /**
     * Constructs new set from the unique numbers in the given array or from raw binary storage value.
     *
     * In case array is specified, only unique numbers are added to the set. Number duplicates are silently ignored.
     *
     * Set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers to construct this set from or raw binary storage value.
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
     * Constructs new set from the unique numbers specified via rest parameters.
     *
     * Only unique numbers are added to the set. Number duplicates are silently ignored.
     *
     * Set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers to construct this set from.
     *
     * @returns new set from the given numbers.
     */
    static of(...val: ReadonlyArray<number>) {
        return new FastNumSet(val);
    }

    /**
     * Returns copy of binary storage used for lookup and mutable operations on this set.
     */
    get binaryStorage() {
        return this._binaryStorage;
    }

    /**
     * @see {ReadonlyFastNumSet.hasAll}
     */
    hasAll(val: ReadonlyFastNumSet) {
        return (this._binaryStorage & val.binaryStorage) === val.binaryStorage;
    }

    /**
     * @see {ReadonlyFastNumSet.doesNotHaveAny}
     */
    doesNotHaveAny(val: ReadonlyFastNumSet) {
        return (this._binaryStorage & val.binaryStorage) === 0;
    }

    /**
     * @see {ReadonlyFastNumSet.remaining}
     */
    remaining(): ReadonlyFastNumSet {
        return new FastNumSet(FastNumSet.ALL_NUMBERS_BINARY_STORAGE ^ this._binaryStorage);
    }

    /**
     * Adds all numbers from another set to this set.
     *
     * This method changes this set and does NOT modify `val` set.
     *
     * Only the numbers which are NOT yet present in this set are added.
     * Duplicate numbers are ignored.
     *
     * @param val - Another set containing numbers to add to this set.
     */
    add(val: ReadonlyFastNumSet) {
        this._binaryStorage |= val.binaryStorage;
    }

    /**
     * Removes all numbers present in another set from this set.
     *
     * This method changes this set and does NOT modify `val` set.
     *
     * Only the numbers which are present in this set are removed.
     * Missing numbers are ignored.
     *
     * @param val - Another set containing numbers to remove from this set.
     */
    remove(val: ReadonlyFastNumSet) {
        this._binaryStorage &= ~val.binaryStorage;
    }
}
