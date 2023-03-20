/**
 * Bit storage used for efficient checking/manipulation of the numbers sets of sizes up to 32.
 *
 * Represented as built-in `number`, where each bit at position `x` is:
 *  - `0` if the number is included in the set;
 *  - `1` if the number is excluded from the set.
 *
 * @public
 */
export type BitStore32 = number;

/**
 * Numbers set with efficient storage & fast checking operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the values outside of the range.
 *
 * @typeParam T - Specific subtype of {@link ReadonlyNumsSet}
 * to be used as an argument for checking operations.
 */
export interface ReadonlyNumsSet<T extends ReadonlyNumsSet<T>> {

    /**
     * Checks if this set has ALL numbers from another set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this set has ALL numbers from another set; otherwise `false`.
     */
    hasAll(val: T): boolean;

    /**
     * Checks if this set does *not* have the given number.
     *
     * @param val - Number to check.
     *
     * @returns `true` if this set does *not* have the given number; otherwise `false`.
     */
    doesNotHave(val: number): boolean;

    /**
     * Checks if this set does *not* have any numbers from another set.
     *
     * @param val - Another set to check against.
     *
     * @returns `true` if this set does *not* have any numbers from another set; otherwise `false`.
     */
    doesNotHaveAny(val: T): boolean;

    /**
     * Checks whether numbers in this set are exactly the same as in another set.
     *
     * @param val - Another set to check equality with this set.
     *
     * @returns `true` if this set has the same numbers as the `val` set; otherwise `false`.
     */
    equals(val: T): boolean;

}

/**
 * Extends {@link ReadonlyNumsSet} with fast manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the values outside of the range.
 *
 * @typeParam ROSET - Specific subtype of {@link ReadonlyNumsSet}
 * to be used as an argument for checking and manipulation operations.
 */
export interface NumsSet<ROSET extends ReadonlyNumsSet<ROSET>> extends ReadonlyNumsSet<ROSET> {

    /**
     * Adds all numbers from another set to this numbers set.
     *
     * This method changes this numbers set and does *not* modify `val` numbers set.
     *
     * Only the numbers which are *not* yet present in this set are added.
     * Duplicate numbers are ignored.
     *
     * @param val - Another set containing numbers to add to this set.
     */
    addAll(val: ROSET): void;

    /**
     * Deletes given number from this numbers set.
     *
     * This method changes this numbers set.
     *
     * The given number is deleted only if it is *not* yet present in this set.
     * Duplicate number is ignored.
     *
     * @param val - Number to delete from this set.
     */
    delete(val: number): void;

    /**
     * Deletes all numbers present in another set from this numbers set.
     *
     * This method changes this numbers set and does *not* modify `val` numbers set.
     *
     * Only the numbers which are present in this set are deleted.
     * Missing numbers are ignored.
     *
     * @param val - Another set containing numbers to delete from this set.
     */
    deleteAll(val: ROSET): void;

    /**
     * Updates this set so that it has only the numbers
     * present in this set `AND` the given `val` numbers set.
     *
     * @param val - Another set to `AND` with this set.
     */
    union(val: ROSET): void;

}
