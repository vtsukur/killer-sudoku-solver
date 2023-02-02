/**
 * Extends standard {@link Set} with capabilities
 * to add and remove {@link Iterable} of elements using {@link addCollection} and {@link deleteCollection}
 * as well as construct instances out of `rest` parameters using {@link of}
 * and get first element in the set using {@link first}.
 *
 * @see {@link Set}
 *
 * @public
 */
export class MutableSet<T> extends Set<T> {

    /**
     * Constructs new set.
     *
     * @param val - If an `Iterable` is passed, all of its elements will be added to the new set.
     * If no `Iterable` is specified, or its value is `null`, the new set is empty.
     *
     * @see {@link Set}
     */
    constructor(val?: Iterable<T>) {
        super(val);
    }

    /**
     * Constructs new set with the given elements specified via rest parameters.
     *
     * @param val - Elements to be added to the set.
     *
     * @returns new set with the given elements.
     */
    static of<T>(...val: ReadonlyArray<T>) {
        return new MutableSet(val);
    }

    /**
     * Adds all elements in the given `Iterable` to this set, if they are not in the set yet.
     *
     * @param val - `Iterable` of elements to be added to the set.
     *
     * @returns This set with added values.
     */
    addCollection(val: Iterable<T>) {
        for (const oneOf of val) {
            this.add(oneOf);
        }
        return this;
    }

    /**
     * Deletes all elements in the given `Iterable` from the set, if they are in the set.
     *
     * @param val - `Iterable` of elements to be deleted from the set.
     *
     * @returns This set with removed values.
     */
    deleteCollection(val: Iterable<T>) {
        for (const oneOf of val) {
            this.delete(oneOf);
        }
        return this;
    }

    /**
     * Returns first element in the set according to insertion order.
     *
     * @returns first element in the set according to insertion order.
     *
     * @throws {Error} if set has no values.
     */
    get first(): T {
        if (this.size === 0) {
            throw new Error('Can\'t get first element: MutableSet has no values');
        } else {
            return this.values().next().value;
        }
    }
}
