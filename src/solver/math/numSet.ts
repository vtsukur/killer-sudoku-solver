export class NumSet implements Iterable<number> {
    private readonly _set: Set<number>;

    constructor(...val: ReadonlyArray<number>) {
        this._set = new Set(val);
    }

    [Symbol.iterator](): Iterator<number> {
        return this._set.values();
    }

    has(val: number) {
        return this._set.has(val);
    }

    mergeWith(val: NumSet) {
        for (const num of val.nums) {
            this._set.add(num);
        }
    }

    add(...val: ReadonlyArray<number>) {
        for (const num of val) {
            this._set.add(num);
        }
    }

    delete(...val: ReadonlyArray<number>) {
        for (const num of val) {
            this._set.delete(num);
        }
    }

    get nums(): ReadonlySet<number> {
        return this._set;
    }
}
