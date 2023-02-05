export class NumFlags {
    private _bin = 0;

    constructor(val?: ReadonlyArray<number>) {
        if (val) {
            for (const num of val) {
                this._bin |= 1 << num;
            }
        }
    }

    static of(...val: ReadonlyArray<number>) {
        return new NumFlags(val);
    }

    has(val: NumFlags) {
        return (this._bin & val._bin) === val._bin;
    }

    doesNotHaveAny(val: NumFlags) {
        return (this._bin & val._bin) === 0;
    }

    mark(val: NumFlags) {
        this._bin |= val._bin;
    }

    unmark(val: NumFlags) {
        this._bin &= ~val._bin;
    }
}
