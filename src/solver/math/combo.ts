import { CachedNumRanges } from '../../util/cachedNumRanges';
import { BitStore32, ReadonlySudokuNumsSet, SudokuNumsSet } from '../sets';

/**
 * Combination of numbers used mainly to represent addends of `Cage` sum.
 *
 * Combination allows duplication of numbers.
 *
 * @public
 */
export class Combo implements Iterable<number> {

    /**
     * Set of unique Sudoku numbers between 1 and 9 present in this {@link Combo}
     * with efficient storage & fast checking/manipulation operations.
     */
    readonly numsSet: ReadonlySudokuNumsSet;

    readonly numsBits: BitStore32;

    readonly nums: ReadonlyArray<number>;

    readonly number1: number;

    readonly number2: number;

    readonly number3: number;

    readonly index: number;

    static readonly INSTANCES: ReadonlyArray<Combo> = (() => {
        const val = new Array<Combo>(1024); // compact by 2
        let i = 0;
        const combosByCount: Array<Map<number, Array<[number, ReadonlyArray<number>]>>> = CachedNumRanges.ZERO_TO_N_LTE_81[10].map(() => new Map<number, Array<[number, ReadonlyArray<number>]>>());
        while (++i < 1024) {
            if (i & 1) continue;
            const nums = new SudokuNumsSet(i).nums;
            const sum = nums.reduce((prev, current) => prev + current, 0);
            const map = combosByCount[nums.length];
            if (!map.has(sum)) {
                map.set(sum, []);
            }
            (map.get(sum) as Array<[number, ReadonlyArray<number>]>).push([i, nums]);
        }
        combosByCount.forEach((map, count) => {
            if (count === 0) return;
            for (const bitStoreAndNums of map.values()) {
                let index = 0;
                bitStoreAndNums.sort((a, b) => parseInt(a[1].join('')) - parseInt(b[1].join('')));
                for (const [ bitStore, nums ] of bitStoreAndNums) {
                    val[bitStore] = new Combo(new SudokuNumsSet(nums), index);
                    ++index;
                }
            }
        });
        return val;
    })();

    /**
     * Constructs new combination of the given numbers.
     *
     * @param val - Numbers to construct a combination from.
     */
    private constructor(numsSet: ReadonlySudokuNumsSet, index: number) {
        if (numsSet.bitStore === 0) {
            throw new RangeError('Combo should have at least 1 number');
        }
        this.numsSet = numsSet;
        this.numsBits = numsSet.bitStore;
        this.nums = numsSet.nums;
        this.number1 = this.nums[0];
        this.number2 = (this.nums.length > 1) ? this.nums[1] : 0;
        this.number3 = (this.nums.length > 2) ? this.nums[2] : 0;
        this.index = index;
    }

    /**
     * Constructs new combination of the given numbers specified via rest parameters.
     *
     * @param val - Numbers to construct a combination from.
     *
     * @returns new combination of the given numbers.
     */
    static of(...val: ReadonlyArray<number>) {
        if (val.length === 0) {
            throw new RangeError('Combo should have at least 1 number');
        }
        let bitStore = 0;
        for (const num of val) {
            bitStore |= 1 << num;
        }
        return Combo.INSTANCES[bitStore];
    }

    static ofOne(val: number) {
        // check number to be within the range.
        return Combo.INSTANCES[1 << val];
    }

    static fromNumsSet(val: ReadonlySudokuNumsSet) {
        if (val.bitStore === 0) {
            throw new RangeError('Combo should have at least 1 number');
        }

        // check bitstore to be withing the range?
        return Combo.INSTANCES[val.bitStore];
    }

    static fromBits(val: BitStore32) {
        // check number to be within the range.
        if (val === 0) {
            throw new RangeError('Combo should have at least 1 number');
        }

        // check bittore to be withing the range?
        return Combo.INSTANCES[val];
    }

    /**
     * Returns number with the n-th `index` in the combination.
     *
     * @param index - Index of the number in the combination.
     *
     * @returns number with the n-th `index` in the combination.
     *
     * @throws {RangeError} if the given index is outside of combination numbers range.
     */
    nthNumber(index: number) {
        if (index < 0 || index > this.nums.length - 1) {
            throw new RangeError(`Number of index ${index} cannot be accessed. Combo has ${this.nums.length} element(s)`);
        } else {
            return this.nums[index];
        }
    }

    /**
     * Convention-based method of iterator protocol that turns this object into iterable
     * and allows its use in a `for...of` loop and various other syntaxes.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
     *
     * @returns iterator over numbers in this combination.
     */
    [Symbol.iterator](): Iterator<number> {
        return this.nums.values();
    }

    /**
     * Checks if the given number is a part of this combination.
     *
     * @param val - Number to check for being a part of this combination.
     *
     * @returns `true` if the given number is a part of this combination, otherwise `false`.
     */
    has(val: number) {
        return this.numsSet.has(val);
    }

    /**
     * Reduces the size of the combination by deleting the given number.
     *
     * @param num - Number to reduce this combination by.
     *
     * @returns new combination without the given number if it is a part of this combination or
     * this combination if the given number is not a part of this combination.
     */
    reduce(num: number): Combo {
        return Combo.INSTANCES[this.numsBits & ~(1 << num)];
    }

}

/**
 * Readonly array of `Combo`s.
 */
export type ReadonlyCombos = ReadonlyArray<Combo>;
