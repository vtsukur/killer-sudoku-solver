import { joinArray } from '../../util/readableMessages';

export type ComboKey = string;

export class Combo {
    readonly nums: ReadonlyArray<number>;
    private readonly numSet: ReadonlySet<number>;
    readonly key: ComboKey;

    static of(...nums: ReadonlyArray<number>) {
        return new Combo(nums);
    }

    has(num: number) {
        return this.numSet.has(num);
    }

    private constructor(nums: ReadonlyArray<number>) {
        this.nums = nums;
        this.numSet = new Set(nums);
        this.key = joinArray(nums);
    }
}

export type ReadonlyCombos = ReadonlyArray<Combo>;
