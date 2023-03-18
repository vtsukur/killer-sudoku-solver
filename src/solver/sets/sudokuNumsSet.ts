import * as _ from 'lodash';
import { CachedNumRanges } from '../../util/cachedNumRanges';
import { BitStore32, NumsSet, ReadonlyNumsSet } from './numsSet';
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
     * Returns copy of the bit storage used for efficient checking for this numbers set.
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
     * Produces numbers which are included in this set.
     *
     * @returns Numbers which are included in this set.
     */
    nums(): ReadonlyArray<number>;

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
export class SudokuNumsSet implements
        ReadonlySudokuNumsSet,
        NumsSet<ReadonlySudokuNumsSet, SudokuNumsSet> {

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
    static readonly RANGE = CachedNumRanges.ONE_TO_N_LTE_10[this.MAX_NUM + 1];

    // Numbers from 1 to 9 are marked as `1` bits on respective positions.
    private static readonly _ALL_SUDOKU_NUMS_BIT_STORE = this.RANGE.reduce(
        (prev, current) => prev | 1 << current, 0
    );

    /**
     * Lookup table for numbers represented as the array
     * indexed by unique number for the 32-bit _power of 2_ integer.
     */
    private static readonly _LOOKUP_TABLE: PowersOf2Lut<number> = (() => {
        // Creating empty lookup tables for each bit store.
        const val = new PowersOf2Lut<number>();

        // Iterating over all possible `Cell` indices on the `Grid`.
        for (const index of this.RANGE) {
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

    //
    // One bit store in the form of a built-in `number` can store up to 32 bits,
    // which is more than enough to represents numbers in the range of [1, 9].
    //
    private _bitStore = 0;

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
        if (typeof val === 'number') {
            this._bitStore = val;
        } else if (Array.isArray(val)) {
            for (const num of val) {
                //
                // Applying bitwise OR with left-wise shift to mark bit at position `num` as `1`.
                //
                // Examples:
                //  - for `num = 1`, `bitStore` will be bitwise OR-ed with `0b000000010`;
                //  - for `num = 2`, `bitStore` will be bitwise OR-ed with `0b000000100`;
                //  - ...
                //  - for `num = 9`, `bitStore` will be bitwise OR-ed with `0b100000000`;
                //
                // For `num = 1` and `num = 4` `bitStore` will be `0b000010010`.
                //
                this._bitStore |= 1 << num;
            }
        } else {
            this._bitStore = (val as ReadonlySudokuNumsSet).bitStore;
        }

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
     * @see ReadonlySudokuNumsSet.bitStore
     */
    get bitStore() {
        return this._bitStore;
    }

    /**
     * @see ReadonlySudokuNumsSet.nums
     */
    nums() {
        return this._nums;
    }

    /**
     * @see ReadonlySudokuNumsSet.has
     */
    has(val: number) {
        return (this._bitStore & (1 << val)) !== 0;
    }

    /**
     * @see ReadonlySudokuNumsSet.hasOnly
     */
    hasOnly(val: number) {
        return this.has(val) && (this._bitStore & (this._bitStore - 1)) === 0;
    }

    /**
     * @see ReadonlySudokuNumsSet.hasAll
     */
    hasAll(val: ReadonlySudokuNumsSet) {
        //
        // Applying bitwise AND to check that each bit store of this set
        // has `1`s at the same positions as each bit store of the `val` set.
        //
        // Example for `hasAll` returning `true`:
        // ```
        //      this._bitStore                = 0b010010101
        //      val.bitStore                  = 0b010000100
        //      this._bitStore & val.bitStore = 0b010000100
        //
        //      0b010000100 === 0b010000100
        //      (this._bitStore & val.bitStore) === val.bitStore
        //
        // ```
        //
        // Example for `hasAll` returning `false`:
        // ```
        //      this._bitStore                = 0b010010101
        //      val.bitStore                  = 0b000001100
        //      this._bitStore & val.bitStore = 0b000000100
        //
        //      0b000001100 !== 0b000000100
        //      (this._bitStore & val.bitStore) !== val.bitStore
        // ```
        //
        return (this._bitStore & val.bitStore) === val.bitStore;
    }

    /**
     * @see ReadonlyNumsSet.doesNotHave
     */
    doesNotHave(val: number) {
        return (this._bitStore & (1 << val)) === 0;
    }

    /**
     * @see ReadonlySudokuNumsSet.doesNotHaveAny
     */
    doesNotHaveAny(val: ReadonlySudokuNumsSet) {
        //
        // Applying bitwise AND to check that each bit store of this set
        // does *not* have `1`s at the same positions as each bit store of the `val` set.
        //
        // Example for `doesNotHaveAny` returning `true`:
        // ```
        //      this._bitStore                = 0b010010101
        //      val.bitStore                  = 0b001101000
        //      this._bitStore & val.bitStore = 0b000000000 (no overlaps on the same bit positions)
        //
        //      (this._bitStore & val.bitStore) === 0
        // ```
        //
        // Example for `doesNotHaveAny` returning `false`:
        // ```
        //      this._bitStore                = 0b10010101
        //      val.bitStore                  = 0b00001100
        //      this._bitStore & val.bitStore = 0b00000100 (one overlap on the bit position 3)
        //
        //      (this._bitStore & val.bitStore) !== 0
        // ```
        //
        return (this._bitStore & val.bitStore) === 0;
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

    /**
     * @see NumsSet.addAll
     */
    addAll(val: ReadonlySudokuNumsSet) {
        //
        // Applying bitwise OR assignment on the bit store of this set
        // to merge `1`s from the bit store of the `val` set.
        //
        // Example:
        // ```
        //      this._bitStore                 = 0b010010001
        //      val.bitStore                   = 0b001001000
        //      this._bitStors |= val.bitStore = 0b011011001
        // ```
        //
        this._bitStore |= val.bitStore;

        this._nums = SudokuNumsSet._NUMS_ALL_PERMS_CACHE[this._bitStore];

        return this;
    }

    /**
     * @see NumsSet.delete
     */
    deleteAll(val: ReadonlySudokuNumsSet) {
        //
        // Applying bitwise AND assignment on the bit store of this set
        // to merge `1`s from the bit store of the `val` set.
        //
        // Example:
        // ```
        //      this._bitStore                  = 0b10011001
        //      val.bitStore                    = 0b01001001
        //      ~val.bitStore                   = 0b10110110 (bit inversion gives us value that can be `&`-ed on)
        //      this._bitStore &= ~val.bitStore = 0b10010000
        // ```
        //
        this._bitStore &= ~val.bitStore;

        this._nums = SudokuNumsSet._NUMS_ALL_PERMS_CACHE[this._bitStore];

        return this;
    }

    /**
     * Deletes given number from this set if it is present.
     *
     * This method changes this set.
     *
     * @param val - Number to delete from this set if it is present.
     *
     * @returns This set.
     */
    delete(val: number) {
        if (this.has(val)) {
            //
            // Applying bitwise XOR assignment on the bit store of this set
            // to clear `1` on the position corresponding to the number `val`.
            //
            // Example:
            // ```
            //      this._bitStore             = 0b10011001
            //      val                        = 4
            //      1 << val                   = 0b00001000 (4)
            //      this._bitStore ^= 1 << val = 0b10010001 (bit at position `4` is reset to `0`)
            // ```
            //
            this._bitStore ^= 1 << val;

            this._nums = SudokuNumsSet._NUMS_ALL_PERMS_CACHE[this._bitStore];
        }

        return this;
    }

    /**
     * @see NumsSet.union
     */
    union(val: ReadonlySudokuNumsSet) {
        //
        // Applying bitwise AND assignment on the bit store of this set
        // to `AND` `1`s from the bit store of the `val` set.
        //
        // Example:
        // ```
        //      this._bitStore                 = 0b10011001
        //      val.bitStore                   = 0b01001001
        //      this._bitStore &= val.bitStore = 0b00001001 (only 2 bits at the same position are `1`s)
        // ```
        //
        this._bitStore &= val.bitStore;

        this._nums = SudokuNumsSet._NUMS_ALL_PERMS_CACHE[this._bitStore];

        return this;
    }

    /**
     * @see ReadonlyNumsSet.equals
     */
    equals(val: ReadonlySudokuNumsSet) {
        return this._bitStore === val.bitStore;
    }

    /**
     * @see NumsSet.clone
     */
    clone() {
        return new SudokuNumsSet(this._bitStore);
    }

}
