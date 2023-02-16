/**
 * Bit storage used for efficient checking/manipulation of the checking numbers sets of sizes up to 32.
 *
 * Represented as built-in `number`, where each bit at position `x` is:
 *  - `0` if the number is included in the checking set;
 *  - `1` if the number is excluded from the checking set.
 *
 * @public
 */
export type BitStore32 = number;

/**
 * Checking numbers set with efficient storage & fast checking operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the values outside of the range.
 *
 * @typeParam T - Specific subtype of {@link ReadonlyNumsCheckingSet}
 * to be used as an argument for checking operations.
 */
export interface ReadonlyNumsCheckingSet<T extends ReadonlyNumsCheckingSet<T>> {

    /**
     * Checks if this set has ALL numbers from another checking set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this checking set has ALL numbers from another checking set; otherwise `false`.
     */
    hasAll(val: T): boolean;

    /**
     * Checks if this set does NOT have any numbers from another checking set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this checking set does NOT have any numbers from another checking set; otherwise `false`.
     */
    doesNotHaveAny(val: T): boolean;
}

/**
 * Checking numbers set with efficient storage & fast checking and manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the values outside of the range.
 *
 * @typeParam T - Specific subtype of {@link ReadonlyNumsCheckingSet}
 * to be used as an argument for checking and manipulation operations.
 */
export interface NumsCheckingSet<T extends ReadonlyNumsCheckingSet<T>> extends ReadonlyNumsCheckingSet<T> {

    /**
     * Adds all numbers from another checking set to this checking numbers set.
     *
     * This method changes this checking numbers set and does NOT modify `val` checking numbers set.
     *
     * Only the numbers which are NOT yet present in this checking set are added.
     * Duplicate numbers are ignored.
     *
     * @param val - Another checking set containing numbers to add to this set.
     */
    add(val: T): void;

    /**
     * Removes all numbers present in another checking set from this checking numbers set.
     *
     * This method changes this checking numbers set and does NOT modify `val` checking numbers set.
     *
     * Only the numbers which are present in this checking set are removed.
     * Missing numbers are ignored.
     *
     * @param val - Another checking set containing numbers to remove from this checking set.
     */
    remove(val: T): void;
}
