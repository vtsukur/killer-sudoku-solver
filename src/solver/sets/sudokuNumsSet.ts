import * as _ from 'lodash';
import { CachedNumRanges } from '../../util/cachedNumRanges';
import { Bits32Set } from './bits32Set';
import { BitStore32, ReadonlyNumsSet } from './numsSet';
import { PowersOf2Lut } from './powersOf2Lut';

/**
 * Set of Sudoku numbers between 1 and 9 with efficient storage & fast checking operations
 * which can be used to mark numbers as included or excluded in {@link Cage}s and {@link Cage} areas.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the numbers outside of the Sudoku range (<1, >9).
 *
 * @public
 */
export interface ReadonlySudokuNumsSet extends ReadonlyNumsSet<ReadonlySudokuNumsSet> {

    /**
     * Returns copy of the bit storage used for efficient checking for this set.
     */
    get bitStore(): BitStore32;

    /**
     * Checks if this set has the given number.
     *
     * @param val - Number to check for being included in this set.
     *
     * @returns `true` if this set has the given number; otherwise `false`.
     */
    has(val: number): boolean;

    /**
     * Checks if this set has only the given number.
     *
     * @param val - Number to check for being the only number in this set.
     *
     * @returns `true` if this set has only the given number; otherwise `false`.
     */
    hasOnly(val: number): boolean;

    /**
     * Numbers which are included in this set.
     */
    get nums(): ReadonlyArray<number>;

    /**
     * Amount of numbers which are included in this set.
     */
    get size(): number;

    /**
     * Returns new set with Sudoku numbers which are *not* present in the current set.
     *
     * For example, if a set has numbers [1, 2, 5, 9] then
     * the remaining set of numbers will be [3, 4, 6, 7, 8].
     *
     * @returns new set with Sudoku numbers which are *not* present in the current set.
     */
    get remaining(): SudokuNumsSet;

}

/**
 * Extends {@link ReadonlySudokuNumsSet} with fast manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * @see ReadonlySudokuNumsSet
 * @see NumsSet
 *
 * @public
 */
export class SudokuNumsSet extends Bits32Set<ReadonlySudokuNumsSet> {

    /**
     * Minimum Sudoku number (`1`) which can be placed in a {@link Cell}.
     */
    static readonly MIN_NUM = 1;

    /**
     * Maximum Sudoku number (`9`) which can be placed in a {@link Cell}.
     */
    static readonly MAX_NUM = 9;

    /**
     * Range of all possible Sudoku numbers (`[1, 9]`) which can be placed in a {@link Cell}
     * in the form of readonly array.
     */
    static readonly NUM_RANGE = CachedNumRanges.ONE_TO_N_LTE_10[this.MAX_NUM + 1];

    // Numbers from 1 to 9 are marked as `1` bits on respective positions.
    private static readonly _ALL_SUDOKU_NUMS_BIT_STORE = this.NUM_RANGE.reduce(
        (prev, current) => prev | 1 << current, 0
    );

    /**
     * Lookup table for numbers represented as the array
     * indexed by unique number for the 32-bit _power of 2_ integer.
     */
    private static readonly _LOOKUP_TABLE: PowersOf2Lut<number> = (() => {
        // Creating empty lookup tables for each bit store.
        const val = new PowersOf2Lut<number>();

        // Iterating over all possible Sudoku numbers.
        for (const index of this.NUM_RANGE) {
            val.set(index, index);
        }

        return val;
    })();

    /**
     * [PERFORMANCE] Cache for the arrays of numbers by a bit store
     * to avoid recalculation of `nums` each time it is needed.
     *
     * It has 512 elements (`2 ^ 9`) and looks as follows:
     * ```
     * [
     *      [],             // 0'th element for the bit store `0`.
     *      [ 1 ],          // 1'th element for the bit store `1`.
     *      [ 2 ],          // 2'th element for the bit store `2`.
     *      [ 1, 2 ],       // 3'th element for the bit store `3`.
     *      [ 3 ],          // 4'th element for the bit store `4`.
     *      [ 1, 3 ],       // 5'th element for the bit store `5`.
     *      [ 2, 3 ],       // 6'th element for the bit store `6`.
     *      [ 1, 2, 3 ],    // 7'th element for the bit store `7`.
     *      [ 4 ],          // 8'th element for the bit store `8`.
     *      ...
     *      [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] // 511'th element for the bit store `511`.
     * ]
     * ```
     */
    private static readonly _NUMS_ALL_PERMS_CACHE: ReadonlyArray<ReadonlyArray<number>> =
        _.range(this._ALL_SUDOKU_NUMS_BIT_STORE + 1).map(i => SudokuNumsSet._LOOKUP_TABLE.collect(i));

    /**
     * Empty readonly set without any Sudoku numbers.
     */
    static readonly EMPTY: ReadonlySudokuNumsSet = SudokuNumsSet.newEmpty();

    /**
     * Readonly set with all Sudoku numbers in the `[1, 9]` range.
     */
    static readonly ALL: ReadonlySudokuNumsSet = SudokuNumsSet.all();

    static accumulator(accumulator: SudokuNumsSet, current: ReadonlySudokuNumsSet) {
        accumulator.addAll(current);
    }

    // Cached numbers array for the fast `nums` retrieval.
    private _nums: ReadonlyArray<number>;

    /**
     * Constructs new set from the unique numbers in the given array
     * or from another {@link ReadonlySudokuNumsSet} or from the {@link BitStore32}.
     *
     * In case array is specified, only unique numbers are added to the set.
     * Number duplicates are silently ignored.
     *
     * Set is constructed as empty if no numbers are given.
     *
     * @param val - Readonly array of numbers or {@link ReadonlySudokuNumsSet}
     * or {@link BitStore32} to construct this set from.
     */
    constructor(val: ReadonlyArray<number> | ReadonlySudokuNumsSet | BitStore32) {
        super(val);

        this._nums = SudokuNumsSet._NUMS_ALL_PERMS_CACHE[this._bitStore];
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
        return new SudokuNumsSet(val);
    }

    /**
     * Constructs new set from the given single number.
     *
     * @param val - Single number to construct this set from.
     *
     * @returns new set from the given single number.
     */
    static ofSingle(val: number) {
        return new SudokuNumsSet(1 << val);
    }

    /**
     * Constructs new empty set.
     *
     * This method of construction for an empty set is preferable in terms of readability, memory and performance
     * over `SudokuNumsSet.of()` as it avoids construction of an empty array argument
     * and array iterator in constructor.
     *
     * @returns New empty set.
     */
    static newEmpty() {
        return new SudokuNumsSet(0);
    }

    /**
     * Constructs new set with all unique Sudoku numbers
     * in the range from {@link SudokuNumsSet.MIN_NUM} to {@link SudokuNumsSet.MAX_NUM} (inclusive).
     *
     * @returns New set with all unique Sudoku numbers
     * in the range from {@link SudokuNumsSet.MIN_NUM} to {@link SudokuNumsSet.MAX_NUM} (inclusive).
     */
    static all() {
        return new SudokuNumsSet(this._ALL_SUDOKU_NUMS_BIT_STORE);
    }

    /**
     * @see ReadonlySudokuNumsSet.nums
     */
    get nums() {
        return this._nums;
    }

    /**
     * @see ReadonlySudokuNumsSet.size
     */
    get size() {
        return this._nums.length;
    }

    get first(): number | undefined {
        if (this._bitStore !== 0) {
            return this._nums[0];
        }
    }

    /**
     * @see ReadonlySudokuNumsSet.remaining
     */
    get remaining(): SudokuNumsSet {
        //
        // Applying bitwise XOR on the bit store of this set
        // and the constant bit store with all Sudoku numbers so that:
        //  - `1`+`0` bits are turned into `1`s (to include number);
        //  - `1`+`1` bits are turned into `0`s (to exclude number).
        //
        // Example:
        // ```
        //      ALL_SUDOKU_NUMS_BIT_STORE                 = 0b0111111111
        //      this.bitStore                             = 0b0011010001
        //      ALL_SUDOKU_NUMS_BIT_STORE ^ this.bitStore = 0b0100101110 (inversed `this.bitStore`)
        // ```
        //
        return new SudokuNumsSet(SudokuNumsSet._ALL_SUDOKU_NUMS_BIT_STORE ^ this.bitStore);
    }

    protected onUpdate() {
        this._nums = SudokuNumsSet._NUMS_ALL_PERMS_CACHE[this._bitStore];
    }

    /**
     * Acts just like {@link NumsSet.union}
     * and returns the new {@link ReadonlySudokuNumsSet},
     * which has all the numbers deleted as a part of the `union` operation.
     *
     * @param val - Another set to `AND` with this set.
     *
     * @returns {@link ReadonlySudokuNumsSet},
     * which has all the numbers deleted as a part of the `union` operation.
     *
     * @see NumsSet.union
     */
    unionWithDeleted(val: ReadonlySudokuNumsSet): ReadonlySudokuNumsSet {
        const oldBitStore = this._bitStore;

        this.union(val);

        //
        // Applying bitwise XOR on the bit store of the updated set
        // and the before-update bit store to find the _difference_ between the two,
        // which would determine the deleted numbers.
        //
        // Example:
        // ```
        //      oldBitStore                 = 0b0111111111
        //      this.bitStore               = 0b0011010001
        //      oldBitStore ^ this.bitStore = 0b0100101110
        // ```
        //
        return new SudokuNumsSet(oldBitStore ^ this.bitStore);
    }

    /**
     * Clones this set by creating new instance based on the copy of the state of this set.
     *
     * @returns New set based on the copy of the state of this set.
     */
    clone() {
        return new SudokuNumsSet(this._bitStore);
    }

}
