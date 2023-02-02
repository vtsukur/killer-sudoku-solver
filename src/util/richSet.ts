export class RichSet<T> implements Iterable<T> {
    private readonly _set: Set<T>;

    constructor(val?: Iterable<T>) {
        this._set = new Set(val);
    }

    [Symbol.iterator](): Iterator<T> {
        return this._set.values();
    }

    has(val: T) {
        return this._set.has(val);
    }

    add(val: T) {
        this._set.add(val);
    }

    addCollection(val: Iterable<T>) {
        for (const oneOf of val) {
            this.add(oneOf);
        }
    }

    delete(val: T) {
        this._set.delete(val);
    }

    deleteCollection(val: Iterable<T>) {
        for (const oneOf of val) {
            this.delete(oneOf);
        }
    }

    get values(): ReadonlySet<T> {
        return this._set;
    }

    get first(): T {
        return this._set.values().next().value;
    }

    get size(): number {
        return this._set.size;
    }

    static of<T>(...val: ReadonlyArray<T>) {
        return new RichSet(val);
    }
}
