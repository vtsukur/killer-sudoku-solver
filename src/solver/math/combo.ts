import * as _ from 'lodash';
import { CachedNumRanges } from '../../util/cachedNumRanges';
import { BitStore32, ReadonlySudokuNumsSet, SudokuNumsSet } from '../sets';
import { House } from '../../puzzle/house';

type ComboNumsBitsAndNums = [ BitStore32, ReadonlyArray<number> ];
type CombosNumsBitsAndNums = Array<ComboNumsBitsAndNums>;
type Sum = number;

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

    /**
     * Readonly array of all possible `Combo`s of Sudoku numbers
     * with `Combo`s indexed by their numeric representation,
     * where bit at position `x` is:
     *
     *  - `1` if the number is a part of the `Combo`;
     *  - `0` if the number is **not** a part of the `Combo`.
     *
     * The total amount of distinct `Combo`s for Sudoku numbers is `2 ^ 9 - 1 = 511`.
     * (Not `512` since a `Combo` should have at least one number.)
     *
     * **The total amount of elements in this array, though, is `2 ^ 10 = 1024`
     * for the compatibility with {@link SudokuNumsSet},
     * whose bit store reserves bit at position `0` to represent number `0`,
     * increasing the set of representable numbers in the bit store
     * from `1..9` (9 total) to `0..9` (10 total).**
     *
     * This way, an element is `undefined` if its index has `1` bit at position `0`
     * since a `Combo` of Sudoku numbers **cannot** have the number `0`.
     *
     * Example usage:
     *
     * ```ts
     * Combo.BY_NUMS_BITS[0b100000] // references the `Combo` of a single number `[5]` since the index specified has `1` bit only at position `5`.
     * Combo.BY_NUMS_BITS[0b010110] // references the `Combo` of numbers `[1, 2, 4]` since the index specified has `1` bits at positions `1`, `2`, and `4`.
     * Combo.BY_NUMS_BITS[0b000111] // returns `undefined` since a `Combo` of Sudoku numbers cannot have the number `0` (bit at position `0` is set to `1`).
     * ```
     */
    static readonly BY_NUMS_BITS: ReadonlyCombos = this.createAllPossibleInstancesSortedByNumsBits();

    private static createAllPossibleInstancesSortedByNumsBits() {

        //
        // Defining possible `Combo` permutations count
        // for `NumsSet`-based bit arithmetic as `2 ^ 10 = 1024` instead of _real_ `2 ^ 9 - 1 = 511`.
        //
        // While bringing a minor hit to performance, this approach dramatically simplifies code
        // by keeping compatibility with existing data structures.
        // Otherwise, there would be a need to perform bitwise shifts for `NumsSet` bits
        // (more complex and error-prone) or
        // create an alternative version of `NumsSet` that optimizes storage to ignore `0`s
        // (still tricky and error-prone as it remains incompatible with existing `NumsSet`s).
        //
        // This inefficiency has the CPU hit on initialization
        // (needs to skip permutations with `0`s),
        // while memory-wise, the cost is preserved throughout the execution
        // (as it reserves the place for `512` `undefined` `Combo`s in the array).
        //
        const PERMUTATIONS_COUNT = Math.pow(2, SudokuNumsSet.MAX_NUM_PLUS_1);

        //
        // Step 1.
        //
        // Collecting data for all valid `Combo`s
        // into an array of `Map`s by iterating over index permutations.
        //
        // The amount of `Combo` numbers indexes elements in the array.
        //
        // `Map`s have sums as keys and `CombosNumsBitsAndNums` as values.
        //

        const combosByCountBySum: Array<Map<Sum, CombosNumsBitsAndNums>> = CachedNumRanges.ZERO_TO_N_LTE_81[House.CELL_COUNT_PLUS_1].map(() => new Map());

        let numsBits = 0;
        while (++numsBits < PERMUTATIONS_COUNT) {
            // Skipping permutations with `1` bit at position `0` since a `Combo` *cannot* have the number `0`.
            if (numsBits & 1) continue;

            // Determining the array of Sudoku numbers from the `NumsSet` bits.
            const nums = new SudokuNumsSet(numsBits).nums;

            // Determining the amount of numbers in the `Combo`.
            const count = nums.length;

            // Determining the sum of the numbers in the `Combo`.
            const sum = _.sum(nums);

            // Constructing tuple of numbers' bits and numbers themselves.
            const numsBitsAndNums: ComboNumsBitsAndNums = [ numsBits, nums ];

            // Adding tuple to the map.
            const combosByCountMap = combosByCountBySum[count];
            const sumCombosNumsBitsAndNums = combosByCountMap.get(sum);
            if (sumCombosNumsBitsAndNums) {
                sumCombosNumsBitsAndNums.push(numsBitsAndNums);
            } else {
                combosByCountMap.set(sum, [ numsBitsAndNums ]);
            }
        }

        //
        // Step 2.
        //
        // Sorting numbers' sets for each count and sum in ascending order
        // for the ease of perception of `Combo` sequence
        // and assigning logical index to `Combo`s.
        //
        // Filling resulting array of all possible `Combo`s of Sudoku numbers.
        //

        const val = new Array<Combo>(PERMUTATIONS_COUNT);

        combosByCountBySum.forEach((combosByCountMap, count) => {
            // `Combo` should have at least one number.
            if (count === 0) return;

            for (const combosNumsBitsAndNums of combosByCountMap.values()) {
                combosNumsBitsAndNums.sort((a, b) => parseInt(a[1].join('')) - parseInt(b[1].join('')));

                let index = 0;
                for (const [ numsBits, nums ] of combosNumsBitsAndNums) {
                    val[numsBits] = new Combo(new SudokuNumsSet(nums), index);
                    ++index;
                }
            }
        });

        return val;
    }

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
        return Combo.BY_NUMS_BITS[bitStore];
    }

    static ofOne(val: number) {
        // check number to be within the range.
        return Combo.BY_NUMS_BITS[1 << val];
    }

    static fromNumsSet(val: ReadonlySudokuNumsSet) {
        if (val.bitStore === 0) {
            throw new RangeError('Combo should have at least 1 number');
        }

        // check bitstore to be withing the range?
        return Combo.BY_NUMS_BITS[val.bitStore];
    }

    static fromBits(val: BitStore32) {
        // check number to be within the range.
        if (val === 0) {
            throw new RangeError('Combo should have at least 1 number');
        }

        // check bittore to be withing the range?
        return Combo.BY_NUMS_BITS[val];
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
        return Combo.BY_NUMS_BITS[this.numsBits & ~(1 << num)];
    }

}

/**
 * Readonly array of `Combo`s.
 */
export type ReadonlyCombos = ReadonlyArray<Combo>;
