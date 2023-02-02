export class MutableSet<T> extends Set<T> {
    constructor(val?: Iterable<T>) {
        super(val);
    }

    addCollection(val: Iterable<T>) {
        for (const oneOf of val) {
            this.add(oneOf);
        }
    }

    deleteCollection(val: Iterable<T>) {
        for (const oneOf of val) {
            this.delete(oneOf);
        }
    }

    get first(): T {
        if (this.size === 0) {
            throw new Error('Can\'t get first element: MutableSet has no values');
        } else {
            return this.values().next().value;
        }
    }

    static of<T>(...val: ReadonlyArray<T>) {
        return new MutableSet(val);
    }
}
