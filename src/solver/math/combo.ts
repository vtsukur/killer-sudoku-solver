import { joinArray } from '../../util/readableMessages';

export type ComboKey = string;

export class Combo {
    readonly nums: ReadonlyArray<number>;
    readonly key: ComboKey;

    private readonly _numSet: ReadonlySet<number>;

    static of(...nums: ReadonlyArray<number>) {
        return new Combo(nums);
    }

    has(num: number) {
        return this._numSet.has(num);
    }

    private constructor(nums: ReadonlyArray<number>) {
        this.nums = nums;
        this._numSet = new Set(nums);
        this.key = joinArray(nums);
    }
}

export type ReadonlyCombos = ReadonlyArray<Combo>;
