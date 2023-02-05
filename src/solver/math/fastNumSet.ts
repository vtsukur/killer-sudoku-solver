export class FastNumSet {
    private _bin = 0;

    constructor(val?: ReadonlyArray<number>) {
        if (val) {
            for (const num of val) {
                this._bin |= 1 << num;
            }
        }
    }

    static of(...val: ReadonlyArray<number>) {
        return new FastNumSet(val);
    }

    hasAll(val: FastNumSet) {
        return (this._bin & val._bin) === val._bin;
    }

    doesNotHaveAny(val: FastNumSet) {
        return (this._bin & val._bin) === 0;
    }

    mark(val: FastNumSet) {
        this._bin |= val._bin;
    }

    unmark(val: FastNumSet) {
        this._bin &= ~val._bin;
    }
}
