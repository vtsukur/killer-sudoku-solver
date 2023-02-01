import { joinArray } from '../../util/readableMessages';

export type ComboKey = string;

export class NumSet {
    readonly nums: ReadonlyArray<number>;
    private readonly numSet: ReadonlySet<number>;
    readonly key: ComboKey;

    static of(...nums: ReadonlyArray<number>) {
        return new NumSet(nums);
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

export type ReadonlyNumSets = ReadonlyArray<NumSet>;
