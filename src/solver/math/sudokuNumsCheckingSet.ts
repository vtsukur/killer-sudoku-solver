import * as _ from 'lodash';
import { SudokuNums } from '../../puzzle/sudokuNums';
import { BitStore32, NumsCheckingSet, ReadonlyNumsCheckingSet } from './numsCheckingSet';
import { PowersOf2Lut } from './powersOf2Lut';

/**
 * Checking set of Sudoku numbers between 1 and 9 with efficient storage & fast checking operations
 * which can be used to mark numbers as included or excluded in {@link Cage}s and {@link Cage} areas.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the numbers outside of the Sudoku range (<1, >9).
 *
 * @public
 */
export interface ReadonlySudokuNumsCheckingSet extends ReadonlyNumsCheckingSet<ReadonlySudokuNumsCheckingSet> {

    /**
     * Returns copy of the bit storage used for efficient checking for this numbers set.
     */
    get bitStore(): BitStore32;

    /**
     * Checks if this set has the given number.
     *
     * @param val - Number to check for being included in this checking set.
     *
     * @returns `true` if this checking set has the given number; otherwise `false`.
     */
    has(val: number): boolean;

    /**
     * Checks if this set has only the given number.
     *
     * @param val - Number to check for being the only number in this checking set.
     *
     * @returns `true` if this checking set has only the given number; otherwise `false`.
     */
    hasOnly(val: number): boolean;

    /**
     * Produces numbers which are included in this checking set.
     *
     * @returns Numbers which are included in this checking set.
     */
    nums(): ReadonlyArray<number>;

    /**
     * Returns new checking set with Sudoku numbers which are *not* present in the current checking set.
     *
     * For example, if a checking set has numbers [1, 2, 5, 9] then
     * the remaining checking set of numbers will be [3, 4, 6, 7, 8].
     *
     * @returns new checking set with Sudoku numbers which are *not* present in the current checking set.
     */
    get remaining(): SudokuNumsCheckingSet;

}

/**
 * Extends {@link ReadonlySudokuNumsCheckingSet} with fast manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * @see ReadonlySudokuNumsCheckingSet
 * @see NumsCheckingSet
 *
 * @public
 */
export class SudokuNumsCheckingSet implements
        ReadonlySudokuNumsCheckingSet,
        NumsCheckingSet<ReadonlySudokuNumsCheckingSet, SudokuNumsCheckingSet> {

    // Numbers from 1 to 9 are marked as `1` bits on respective positions.
    private static readonly _ALL_SUDOKU_NUMS_BIT_STORE = SudokuNums.RANGE.reduce(
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
        for (const index of SudokuNums.RANGE) {
            val.set(index, index);
        }

        return val;
    })();

    /**
     * [PERFORMANCE] Cache for the arrays of numbers by a bit store
     * to avoid recalculation of `nums` each time it is needed.
     */
    private static readonly _NUMS_ALL_PERMS_CACHE: ReadonlyArray<ReadonlyArray<number>> =
        _.range(this._ALL_SUDOKU_NUMS_BIT_STORE + 1).map(i => SudokuNumsCheckingSet._LOOKUP_TABLE.collect(i));

    //
    // One bit store in the form of a built-in `number` can store up to 32 bits,
    // which is more than enough to represents numbers in the range of [1, 9].
    //
    private _bitStore = 0;

    // Cached numbers array for fast `nums` return.
    private _nums: ReadonlyArray<number>;

    /**
     * Constructs new checking set from the unique numbers in the given array
     * or from another {@link ReadonlySudokuNumsCheckingSet} or from the {@link BitStore32}.
     *
     * In case array is specified, only unique numbers are added to the checking set.
     * Number duplicates are silently ignored.
     *
     * Checking set is constructed as empty if no numbers are given.
     *
     * @param val - Readonly array of numbers or {@link ReadonlySudokuNumsCheckingSet}
     * or {@link BitStore32} to construct this checking set from.
     */
    constructor(val: ReadonlyArray<number> | ReadonlySudokuNumsCheckingSet | BitStore32) {
        if (Array.isArray(val)) {
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
        } else if (typeof val === 'number') {
            this._bitStore = val;
        } else {
            this._bitStore = (val as ReadonlySudokuNumsCheckingSet).bitStore;
        }

        this._nums = SudokuNumsCheckingSet._NUMS_ALL_PERMS_CACHE[this._bitStore];
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
        return new SudokuNumsCheckingSet(val);
    }

    /**
     * Constructs new checking set from the given single number.
     *
     * @param val - Single number to construct this checking set from.
     *
     * @returns new checking set from the given single number.
     */
    static ofSingle(val: number) {
        return new SudokuNumsCheckingSet(1 << val);
    }

    /**
     * Constructs new empty checking set.
     *
     * This method of construction for an empty set is preferable in terms of readability, memory and performance
     * over `SudokuNumsCheckingSet.of()` as it avoids construction of an empty array argument
     * and array iterator in constructor.
     *
     * @returns New empty checking set.
     */
    static newEmpty() {
        return new SudokuNumsCheckingSet(0);
    }

    /**
     * Constructs new checking set with all unique Sudoku numbers
     * in the range from {@link SudokuNums.MIN} to {@link SudokuNums.MAX} (inclusive).
     *
     * @returns New checking set with all unique Sudoku numbers
     * in the range from {@link SudokuNums.MIN} to {@link SudokuNums.MAX} (inclusive).
     */
    static all() {
        return new SudokuNumsCheckingSet(this._ALL_SUDOKU_NUMS_BIT_STORE);
    }

    /**
     * @see ReadonlySudokuNumsCheckingSet.bitStore
     */
    get bitStore() {
        return this._bitStore;
    }

    /**
     * @see ReadonlySudokuNumsCheckingSet.nums
     */
    nums() {
        return this._nums;
    }

    /**
     * @see ReadonlySudokuNumsCheckingSet.has
     */
    has(val: number) {
        return (this._bitStore & (1 << val)) !== 0;
    }

    /**
     * @see ReadonlySudokuNumsCheckingSet.hasOnly
     */
    hasOnly(val: number) {
        return this.has(val) && (this._bitStore & (this._bitStore - 1)) === 0;
    }

    /**
     * @see ReadonlySudokuNumsCheckingSet.hasAll
     */
    hasAll(val: ReadonlySudokuNumsCheckingSet) {
        //
        // Applying bitwise AND to check that each bit store of this checking set
        // has `1`s at the same positions as each bit store of the `val` checking set.
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
     * @see ReadonlyNumsCheckingSet.doesNotHave
     */
    doesNotHave(val: number) {
        return (this._bitStore & (1 << val)) === 0;
    }

    /**
     * @see ReadonlySudokuNumsCheckingSet.doesNotHaveAny
     */
    doesNotHaveAny(val: ReadonlySudokuNumsCheckingSet) {
        //
        // Applying bitwise AND to check that each bit store of this checking set
        // does *not* have `1`s at the same positions as each bit store of the `val` checking set.
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
     * @see ReadonlySudokuNumsCheckingSet.remaining
     */
    get remaining(): SudokuNumsCheckingSet {
        //
        // Applying bitwise XOR on the bit store of this checking set
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
        return new SudokuNumsCheckingSet(SudokuNumsCheckingSet._ALL_SUDOKU_NUMS_BIT_STORE ^ this.bitStore);
    }

    /**
     * @see NumsCheckingSet.addAll
     */
    addAll(val: ReadonlySudokuNumsCheckingSet) {
        //
        // Applying bitwise OR assignment on the bit store of this checking set
        // to merge `1`s from the bit store of the `val` checking set.
        //
        // Example:
        // ```
        //      this._bitStore                 = 0b010010001
        //      val.bitStore                   = 0b001001000
        //      this._bitStors |= val.bitStore = 0b011011001
        // ```
        //
        this._bitStore |= val.bitStore;

        this._nums = SudokuNumsCheckingSet._NUMS_ALL_PERMS_CACHE[this._bitStore];

        return this;
    }

    /**
     * @see NumsCheckingSet.delete
     */
    deleteAll(val: ReadonlySudokuNumsCheckingSet) {
        //
        // Applying bitwise AND assignment on the bit store of this checking set
        // to merge `1`s from the bit store of the `val` checking set.
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

        this._nums = SudokuNumsCheckingSet._NUMS_ALL_PERMS_CACHE[this._bitStore];

        return this;
    }

    /**
     * Deletes given number from this checking set if it is present.
     *
     * This method changes this checking set.
     *
     * @param val - Number to delete from this checking set if it is present.
     *
     * @returns This checking set.
     */
    delete(val: number) {
        if (this.has(val)) {
            //
            // Applying bitwise XOR assignment on the bit store of this checking set
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

            this._nums = SudokuNumsCheckingSet._NUMS_ALL_PERMS_CACHE[this._bitStore];
        }

        return this;
    }

    /**
     * @see NumsCheckingSet.union
     */
    union(val: ReadonlySudokuNumsCheckingSet) {
        //
        // Applying bitwise AND assignment on the bit store of this checking set
        // to `AND` `1`s from the bit store of the `val` checking set.
        //
        // Example:
        // ```
        //      this._bitStore                 = 0b10011001
        //      val.bitStore                   = 0b01001001
        //      this._bitStore &= val.bitStore = 0b00001001 (only 2 bits at the same position are `1`s)
        // ```
        //
        this._bitStore &= val.bitStore;

        this._nums = SudokuNumsCheckingSet._NUMS_ALL_PERMS_CACHE[this._bitStore];

        return this;
    }

    /**
     * @see ReadonlyNumsCheckingSet.equals
     */
    equals(val: ReadonlySudokuNumsCheckingSet) {
        return this._bitStore === val.bitStore;
    }

    /**
     * @see NumsCheckingSet.clone
     */
    clone() {
        return new SudokuNumsCheckingSet(this._bitStore);
    }

}
