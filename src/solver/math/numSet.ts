export type OneOrManyNumbers = number | Iterable<number>;

export class NumSet implements Iterable<number> {
    private readonly _set: Set<number>;

    constructor(val?: OneOrManyNumbers) {
        if (typeof val === 'undefined') {
            this._set = new Set();
        } else {
            this._set = new Set(typeof val === 'number' ? [ val ] : val);
        }
    }

    [Symbol.iterator](): Iterator<number> {
        return this._set.values();
    }

    has(val: number) {
        return this._set.has(val);
    }

    add(val: OneOrManyNumbers) {
        if (typeof val === 'number') {
            this.doAdd(val);
        } else {
            for (const num of val) {
                this.doAdd(num);
            }
        }
    }

    private doAdd(val: number) {
        this._set.add(val);
    }

    delete(val: OneOrManyNumbers) {
        if (typeof val === 'number') {
            this.doDelete(val);
        } else {
            for (const num of val) {
                this.doDelete(num);
            }
        }
    }

    private doDelete(val: number) {
        this._set.delete(val);
    }

    get nums(): ReadonlySet<number> {
        return this._set;
    }

    get firstNum(): number {
        return this._set.values().next().value;
    }

    get size(): number {
        return this._set.size;
    }

    static of(...val: ReadonlyArray<number>) {
        return new NumSet(val);
    }
}
