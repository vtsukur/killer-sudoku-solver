interface BaseFastNumSet {
    get binaryStorage(): number;
}

export interface ReadonlyFastNumSet extends BaseFastNumSet {
    hasAll(val: ReadonlyFastNumSet): boolean;
    doesNotHaveAny(val: ReadonlyFastNumSet): boolean;
}

/**
 * Set of numbers present with extremely fast and efficient manipulation and lookup operations
 * which leverage bitwise operators on a number.
 *
 * For performance reasons, this class allows working with the numbers in a very small range
 * (>=0 and <=30 without range checks). Otherwise logic is not guaranteed to work properly.
 * While it is enough to handle unique numbers in Sudoku, it is NOT applicable for a wide range of use cases.
 */
export class FastNumSet implements ReadonlyFastNumSet {
    private _binaryStorage = 0;

    /**
     * Constructs new set from the unique numbers in the given array.
     *
     * Only unique numbers are added to the set. Number duplicates are silently ignored.
     *
     * Set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers to construct this set from.
     */
    constructor(val?: ReadonlyArray<number>) {
        if (val) {
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

    get binaryStorage() {
        return this._binaryStorage;
    }

    /**
     * Checks if this set has ALL numbers from another set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this set has ALL numbers from another set; otherwise `false`.
     */
    hasAll(val: ReadonlyFastNumSet) {
        return (this._binaryStorage & val.binaryStorage) === val.binaryStorage;
    }

    /**
     * Checks if this set does NOT have any numbers from another set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this set does NOT have any numbers from another set; otherwise `false`.
     */
    doesNotHaveAny(val: ReadonlyFastNumSet) {
        return (this._binaryStorage & val.binaryStorage) === 0;
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
    add(val: FastNumSet) {
        this._binaryStorage |= val._binaryStorage;
    }

    /**
     * Removes all numbers from another set in this set.
     *
     * This method changes this set and does NOT modify `val` set.
     *
     * Only the numbers which are present in this set are removed.
     * Missing numbers are ignored.
     *
     * @param val - Another set containing numbers to remove from this set.
     */
    remove(val: FastNumSet) {
        this._binaryStorage &= ~val._binaryStorage;
    }
}
