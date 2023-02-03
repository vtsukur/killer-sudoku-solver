/**
 * Utility methods to extend built-in {@link Set} with capabilities
 * to add and remove {@link Iterable} of elements using {@link unite} and {@link differentiate}
 * and get first element in the `Set` using {@link firstValue}.
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

    static new<T>(...val: ReadonlyArray<T>) {
        return new Set<T>(val);
    }

    static unite<T>(target: Set<T>, uniteWith: Iterable<T>) {
        for (const oneOf of uniteWith) {
            target.add(oneOf);
        }
    }

    static differentiate<T>(target: Set<T>, differentiateWith: Iterable<T>) {
        for (const oneOf of differentiateWith) {
            target.delete(oneOf);
        }
    }

    static firstValue<T>(val: Set<T>) {
        if (val.size === 0) {
            throw new RangeError('Can\'t get first element. Set has no values');
        } else {
            return val.values().next().value;
        }
    }
}
