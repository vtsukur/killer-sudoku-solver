export class RichSet<T> extends Set<T> {
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
        return this.values().next().value;
    }

    static of<T>(...val: ReadonlyArray<T>) {
        return new RichSet(val);
    }
}
