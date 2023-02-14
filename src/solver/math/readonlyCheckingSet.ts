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
 * Checking set with efficient storage & fast checking/manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the values outside of the range.
 *
 * @typeParam T - Specific subtype of {@link ReadonlyCheckingSet} to be used as an argument for checking operations.
 *
 * @public
 */
export interface ReadonlyCheckingSet<T> {

    /**
     * Checks if this set has ALL values from another checking set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this checking set has ALL values from another checking set; otherwise `false`.
     */
    hasAll(val: T): boolean;

    /**
     * Checks if this set does NOT have any values from another checking set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this checking set does NOT have any values from another checking set; otherwise `false`.
     */
    doesNotHaveAny(val: T): boolean;
}
