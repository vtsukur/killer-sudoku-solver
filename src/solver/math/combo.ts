import { MutableSet } from '../../util/mutableSet';
import { joinArray } from '../../util/readableMessages';

export type ComboKey = string;

export class Combo implements Iterable<number> {
    readonly key: ComboKey;

    private readonly _nums: ReadonlyArray<number>;
    private readonly _numSet: ReadonlySet<number>;

    constructor(nums: ReadonlyArray<number>) {
        this._nums = [...nums];
        this._numSet = new MutableSet(nums);
        this.key = joinArray(nums);
    }

    static of(...nums: ReadonlyArray<number>) {
        return new Combo(nums);
    }

    get number0() {
        return this.nthNumber(0);
    }

    get number1() {
        return this.nthNumber(1);
    }

    nthNumber(index: number) {
        if (index < 0 || index > this._nums.length - 1) {
            throw new RangeError(`Number with index ${index} cannot be accessed. Combo has ${this._nums.length} elements`);
        } else {
            return this._nums[index];
        }
    }

    [Symbol.iterator](): Iterator<number> {
        return this._nums.values();
    }

    has(num: number) {
        return this._numSet.has(num);
    }

    hasSome(val: Iterable<number>) {
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
            return new Combo(cpy);
        } else {
            return this;
        }
    }
}

export type ReadonlyCombos = ReadonlyArray<Combo>;
