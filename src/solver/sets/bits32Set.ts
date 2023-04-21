import { BitStore32, NumsSet, ReadonlyNumsSet } from './numsSet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseReadonlySudokuNumsSet } from './sudokuNumsSet';

export interface ReadonlyBits32Set<T> extends ReadonlyNumsSet<ReadonlyBits32Set<T>> {

    /**
     * Returns copy of the bit storage used for efficient checking for this set.
     */
    get bitStore(): BitStore32;

}

/**
 * Extends {@link ReadonlySudokuNumsSet} with fast manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * @see ReadonlyBits32Set
 * @see NumsSet
 *
 * @public
 */
export abstract class Bits32Set<
            ROSET extends ReadonlyBits32Set<ROSET>> implements NumsSet<ROSET> {

    //
    // One bit store in the form of a built-in `number` can store up to 32 bits,
    // which is more than enough to represents numbers in the range of [1, 9].
    //
    protected _bitStore = 0;

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
    constructor(val: ReadonlyArray<number> | ROSET | BitStore32) {
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
            this._bitStore = (val as ROSET).bitStore;
        }
    }

    /**
     * @see ReadonlySudokuNumsSet.bitStore
     */
    get bitStore() {
        return this._bitStore;
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
    hasAll(val: ROSET) {
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
    doesNotHaveAny(val: ROSET) {
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
     * @see NumsSet.add
     *
     * @returns This set.
     */
    add(val: number): this {
        //
        // Applying bitwise OR with left-wise shift to set bit at position `val` to `1`.
        //
        // Examples:
        //  - for `val = 0`, `bitStore` will be bitwise OR-ed with `0b00000001`;
        //  - for `val = 1`, `bitStore` will be bitwise OR-ed with `0b00000010`;
        //  - for `val = 2`, `bitStore` will be bitwise OR-ed with `0b00000100`;
        //  - ...
        //  - for `val = 8`, `bitStore` will be bitwise OR-ed with `0b10000000`;
        //
        this._bitStore |= 1 << val;

        this.onUpdate();

        return this;
    }

    /**
     * @see NumsSet.addAll
     *
     * @returns This set.
     */
    addAll(val: ROSET): this {
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

        this.onUpdate();

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
    delete(val: number): this {
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

            this.onUpdate();
        }

        return this;
    }

    /**
     * @see NumsSet.delete
     *
     * @returns This set.
     */
    deleteAll(val: ROSET): this {
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

        this.onUpdate();

        return this;
    }

    /**
     * @see NumsSet.union
     *
     * @returns This set.
     */
    union(val: ROSET): this {
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

        this.onUpdate();

        return this;
    }

    /**
     * Updates this set so that it has only the numbers
     * present in this set `AND` the given `val` bit store.
     *
     * @param val - Another bit store to `AND` with this set.
     *
     * @returns This set.
     */
    unionBits(val: BitStore32): this {
        //
        // Applying bitwise AND assignment on the bit store of this set
        // to `AND` `1`s from the bit store of the `val` set.
        //
        // Example:
        // ```
        //      this._bitStore        = 0b10011001
        //      val                   = 0b01001001
        //      this._bitStore &= val = 0b00001001 (only 2 bits at the same position are `1`s)
        // ```
        //
        this._bitStore &= val;

        this.onUpdate();

        return this;
    }

    /**
     * Describes the reflection of each update to the bit store value.
     *
     * The most typical use case of this method is a manipulation of caches of the subclasses.
     */
    protected abstract onUpdate(): void;

    /**
     * @see ReadonlyNumsSet.equals
     */
    equals(val: ROSET) {
        return this._bitStore === val.bitStore;
    }

    /**
     * @see ReadonlyNumsSet.isEmpty
     */
    get isEmpty(): boolean {
        return this._bitStore === 0;
    }

    /**
     * @see ReadonlyNumsSet.isNotEmpty
     */
    get isNotEmpty(): boolean {
        return this._bitStore !== 0;
    }

}
