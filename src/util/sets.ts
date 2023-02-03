/**
 * Utility methods to extend built-in {@link Set} with the following capabilities:
 *
 * - to construct new `Set` instances out of `rest` parameters using {@link new};
 * - to add and remove {@link Iterable} of values using {@link unite} and {@link differentiate};
 * - to get first value in the `Set` using {@link firstValue}.
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
     * @param target - `Set` to which values are to be added.
     * @param uniteWith - `Iterable` of values to be added to the `target` Set.
     */
    static unite<T>(target: Set<T>, uniteWith: Iterable<T>) {
        for (const oneOf of uniteWith) {
            target.add(oneOf);
        }
    }

    /**
     * Deletes all values from the given `differentiateWith` {@link Iterable} from the `target` {@link Set}
     * if they are present in the `Set`.
     *
     * @param target - `Set` to which values are to deleted.
     * @param uniteWith - `Iterable` of values to be deleted from the `target` Set.
     */
    static differentiate<T>(target: Set<T>, differentiateWith: Iterable<T>) {
        for (const oneOf of differentiateWith) {
            target.delete(oneOf);
        }
    }

    /**
     * Returns first value in the {@link Set} according to insertion order.
     *
     * @param val - `Set` for which to return first value.
     *
     * @returns first value in the `Set` according to insertion order.
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
