import { joinArray } from '../../util/readableMessages';

export type ComboKey = string;

export class Combo implements Iterable<number> {
    readonly key: ComboKey;

    private readonly _nums: ReadonlyArray<number>;
    private readonly _numSet: ReadonlySet<number>;

    static of(...nums: ReadonlyArray<number>) {
        return new Combo(nums);
    }

    [Symbol.iterator](): Iterator<number> {
        return this._nums.values();
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

    reduce(num: number): Combo {
        const numIndex = this._nums.indexOf(num);
        if (numIndex !== -1) {
            const cpy = [...this._nums];
            cpy.splice(numIndex, 1);
            return Combo.of(...cpy);
        } else {
            return Combo.of(...this._nums);
        }
    }

    get number0() {
        return this.nthNumber(0);
    }

    get number1() {
        return this.nthNumber(1);
    }

    nthNumber(index: number) {
        return this._nums[index];
    }

    private constructor(nums: ReadonlyArray<number>) {
        this._nums = nums;
        this._numSet = new Set(nums);
        this.key = joinArray(nums);
    }
}

export type ReadonlyCombos = ReadonlyArray<Combo>;
