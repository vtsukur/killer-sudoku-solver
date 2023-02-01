import { joinArray } from '../../util/readableMessages';

export type ComboKey = string;

export class Combo implements Iterable<number> {
    readonly nums: ReadonlyArray<number>;
    readonly key: ComboKey;

    private readonly _numSet: ReadonlySet<number>;

    static of(...nums: ReadonlyArray<number>) {
        return new Combo(nums);
    }

    [Symbol.iterator](): Iterator<number> {
        return this.nums.values();
    }

    has(num: number) {
        return this._numSet.has(num);
    }

    hasAnyFrom(val: Iterable<number>) {
        for (const num of val) {
            if (this._numSet.has(num)) {
                return true;
            }
        }
        return false;
    }

    private constructor(nums: ReadonlyArray<number>) {
        this.nums = nums;
        this._numSet = new Set(nums);
        this.key = joinArray(nums);
    }
}

export type ReadonlyCombos = ReadonlyArray<Combo>;
