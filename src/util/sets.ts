/**
 * Utility methods that aid {@link Set} manipulation with the following useful capabilities:
 *
 * - constructing new `Set`s out of rest parameters using {@link new} static factory method;
 * - adding and deleting {@link Iterable} of values using {@link U} and {@link _} respectively;
 * - getting first value in the `Set` using {@link firstValue}.
 *
 * @see {@link Set}
 *
 * @public
 */
export class Sets {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Constructs new {@link Set} with the given values specified via rest parameters.
     *
     * Simplifies creation of `Set`s out of values known beforehand
     * without the need of intermediate creation of `Iterable` on the calling side.
     *
     * Examples:
     *
     * ```ts
     * const oneNumberSet = Set.of(1);
     * const fewNumbersSet = Set.of(14, 15, 16);
     * ```
     *
     * @param val - values to be added to the `Set`.
     *
     * @returns new `Set` with the given values.
     */
    static new<T>(...val: ReadonlyArray<T>) {
        return new Set<T>(val);
    }

    /**
     * Adds all values from the given `uniteWith` {@link Iterable} to the `target` {@link Set}
     * if they are not yet present in the `Set`.
     *
     * Essentially, this operation implements 'union' `∪` operation for two `Set`s.
     *
     * This method modifies `target` `Set`.
     *
     * @param target - `Set` to which values are to be added.
     * @param uniteWith - `Iterable` of values to be added to the `target` Set.
     *
     * @returns `target` `Set` to which values have been supposedly added.
     */
    static U<T>(target: Set<T>, uniteWith: Iterable<T>) {
        for (const oneOf of uniteWith) {
            target.add(oneOf);
        }
        return target;
    }

    /**
     * Deletes all values present in the given `differentiateWith` {@link Iterable} from the `target` {@link Set}
     * if they are present in the `Set`.
     *
     * Essentially, this operation implements _difference_ `–` operation for two `Set`s.
     *
     * This method modifies `target` `Set`.
     *
     * @param target - `Set` from which values are to be deleted.
     * @param uniteWith - `Iterable` of values to be deleted from the `target` Set.
     *
     * @returns `target` `Set` to which values have been suppossedly added.
     */
    static _<T>(target: Set<T>, differentiateWith: Iterable<T>) {
        for (const oneOf of differentiateWith) {
            target.delete(oneOf);
        }
        return target;
    }

    /**
     * Returns the first value in the {@link Set} according to insertion order.
     *
     * @param val - `Set` for which to return the first value.
     *
     * @returns the first value in the `Set` according to insertion order.
     *
     * @throws {RangeError} if the `Set` has no values.
     */
    static firstValue<T>(val: Set<T>) {
        if (val.size === 0) {
            throw new RangeError('Can\'t get first value. Set has no values');
        } else {
            return val.values().next().value;
        }
    }

}
