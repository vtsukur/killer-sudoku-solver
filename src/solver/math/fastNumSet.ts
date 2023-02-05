/**
 * Set of numbers present with efficient manipulation and lookup operations.
 */
export class FastNumSet {
    private _bin = 0;

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
                this._bin |= 1 << num;
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
     * Checks if this set has ALL numbers from another set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this set has ALL numbers from another set; otherwise `false`.
     */
    hasAll(val: FastNumSet) {
        return (this._bin & val._bin) === val._bin;
    }

    /**
     * Checks if this set does NOT have any numbers from another set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this set does NOT have any numbers from another set; otherwise `false`.
     */
    doesNotHaveAny(val: FastNumSet) {
        return (this._bin & val._bin) === 0;
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
        this._bin |= val._bin;
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
        this._bin &= ~val._bin;
    }
}
