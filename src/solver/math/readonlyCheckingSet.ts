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
