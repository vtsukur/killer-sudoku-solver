export class NumSet {
    private readonly _set: Set<number>;

    constructor(...val: ReadonlyArray<number>) {
        this._set = new Set(val);
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

    get nums(): ReadonlySet<number> {
        return this._set;
    }
}
