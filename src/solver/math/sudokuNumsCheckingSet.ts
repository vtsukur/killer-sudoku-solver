import { Numbers } from '../../puzzle/numbers';
import { CachedNumRanges } from './cachedNumRanges';
import { BitStore32, NumsCheckingSet, ReadonlyNumsCheckingSet } from './numsCheckingSet';

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
     * Returns new checking set with Sudoku numbers which are NOT present in the current checking set.
     *
     * For example, if a checking set has numbers [1, 2, 5, 9] then
     * the remaining checking set of numbers will be [3, 4, 6, 7, 8].
     *
     * @returns new checking set with Sudoku numbers which are NOT present in the current checking set.
     */
    get remaining(): SudokuNumsCheckingSet;
}

/**
 * Extends {@link ReadonlySudokuNumsCheckingSet} with fast manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * @see {ReadonlySudokuNumsCheckingSet}
 * @see {NumsCheckingSet}
 *
 * @public
 */
export class SudokuNumsCheckingSet implements
        ReadonlySudokuNumsCheckingSet,
        NumsCheckingSet<ReadonlySudokuNumsCheckingSet> {

    //
    // One bit store in the form of a built-in `number` can store up to 32 bits,
    // which is more than enough to represents numbers in the range of [1, 9].
    //
    private _bitStore = 0;

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
        return new SudokuNumsCheckingSet(val);
    }

    /**
     * @see {ReadonlySudokuNumsCheckingSet.bitStore}
     */
    get bitStore() {
        return this._bitStore;
    }

    /**
     * @see {ReadonlySudokuNumsCheckingSet.hasAll}
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
     * @see {ReadonlySudokuNumsCheckingSet.doesNotHaveAny}
     */
    doesNotHaveAny(val: ReadonlySudokuNumsCheckingSet) {
        //
        // Applying bitwise AND to check that each bit store of this checking set
        // does NOT have `1`s at the same positions as each bit store of the `val` checking set.
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

    // Numbers from 1 to 9 are marked as `1` bits on respective positions.
    private static readonly ALL_SUDOKU_NUMS_BIT_STORE = CachedNumRanges.ONE_TO_N_LT_10[Numbers.MAX + 1].reduce(
        (prev, current) => prev | 1 << current, 0
    );

    /**
     * @see {ReadonlySudokuNumsCheckingSet.remaining}
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
        return new SudokuNumsCheckingSet(SudokuNumsCheckingSet.ALL_SUDOKU_NUMS_BIT_STORE ^ this.bitStore);
    }

    /**
     * @see {NumsCheckingSet.add}
     */
    add(val: ReadonlySudokuNumsCheckingSet) {
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
    }

    /**
     * @see {NumsCheckingSet.remove}
     */
    remove(val: ReadonlySudokuNumsCheckingSet) {
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
    }

    /**
     * @see {ReadonlyNumsCheckingSet.equals}
     */
    equals(val: ReadonlySudokuNumsCheckingSet) {
        return this._bitStore === val.bitStore;
    }
}
