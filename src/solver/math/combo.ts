import * as _ from 'lodash';
import { EOL } from 'os';
import { House } from '../../puzzle/house';
import { CachedNumRanges } from '../../util/cachedNumRanges';
import { BitStore32, CombosSet, PowersOf2Lut, ReadonlyCombosSet, ReadonlyCombosSets, ReadonlySudokuNumsSet, SudokuNumsSet } from '../sets';

/**
 * Human-readable key describing combination of numbers.
 */
export type ComboKey = number;

/**
 * Combination of numbers used mainly to represent addends of `Cage` sum.
 *
 * Combination allows duplication of numbers.
 *
 * @public
 */
export class Combo implements Iterable<number> {

    /**
     * Human-readable key describing combination of numbers.
     */
    readonly key: ComboKey;

    /**
     * Set of unique Sudoku numbers between 1 and 9 present in this {@link Combo}
     * with efficient storage & fast checking/manipulation operations.
     */
    readonly numsSet: ReadonlySudokuNumsSet;

    private readonly _nums: ReadonlyArray<number>;

    readonly number1: number;

    readonly number2: number;

    readonly number3: number;

    readonly index: number | undefined;

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
            (map.get(sum) as Array<[number, ReadonlyArray<number>]>).unshift([i, nums]);
        }
        combosByCount.forEach((map, count) => {
            if (count === 0) return;
            for (const bitStoreAndNums of map.values()) {
                let index = 0;
                for (const [ bitStore, nums ] of bitStoreAndNums) {
                    val[bitStore] = new Combo(nums, index);
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
    private constructor(val: ReadonlyArray<number> | BitStore32, index: number) {
        if (typeof(val) === 'number') {
            if (val === 0) {
                throw new RangeError('Combo should have at least 1 number');
            }
        } else {
            if (val.length === 0) {
                throw new RangeError('Combo should have at least 1 number');
            }
        }
        this.numsSet = new SudokuNumsSet(val);
        this._nums = this.numsSet.nums;
        this.number1 = this._nums[0];
        this.number2 = (this._nums.length > 1) ? this._nums[1] : 0;
        this.number3 = (this._nums.length > 2) ? this._nums[2] : 0;
        if (this._nums.length === 4) {
            this.key = this.number1 * 1000 + this.number2 * 100 + this.number3 * 10 + this._nums[3];
        } else {
            this.key = this.number1 * 100 + this.number2 * 10 + this.number3;
        }
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
        if (index < 0 || index > this._nums.length - 1) {
            throw new RangeError(`Number of index ${index} cannot be accessed. Combo has ${this._nums.length} element(s)`);
        } else {
            return this._nums[index];
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
        return this._nums.values();
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
     * Checks if at least one number in the given `Set` is a part of this combination.
     *
     * @param val - `Set` of numbers to check against this combination.
     *
     * @returns `true` if at least one number in the given `Set` is a part of this combination;
     * otherwise `false`.
     */
    hasSome(val: Set<number>) {
        return Array.from(val).some(num => this.numsSet.has(num));
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
        return Combo.of(...this._nums.filter(aNum => aNum !== num));
    }

}

/**
 * Readonly array of `Combo`s.
 */
export type ReadonlyCombos = ReadonlyArray<Combo>;

type PrecomputeComboKey = number;

/**
 * Combinatorics of unique numbers (addends) to form a sum using precomputed values.
 *
 * @public
 */
export class SumCombos {

    /**
     * Array of combinations of unique numbers to form a sum.
     */
    readonly val: ReadonlyCombos;

    /**
     * Permutations of combinations of nonrepeating numbers to form a sum.
     *
     * Each permutation as represented as a readonly array with single element of a {@link Combo}.
     *
     * Used mainly for performance reasons as a cache to avoid construction overhead
     * in implementation of `Combinatorics` types.
     */
    readonly perms: ReadonlyArray<ReadonlyCombos>;

    /**
     * {@link val} wrapped in a single-element array
     * so that it is easy to consume it when it needs to be a part of multiple combinations logic.
     *
     * Used mainly for performance reasons as a cache to avoid construction overhead
     * in implementation of `Combinatorics` types.
     */
    readonly arrayedVal: ReadonlyArray<ReadonlyCombos>;

    readonly combosSet: ReadonlyCombosSet;

    readonly combosSets: ReadonlyCombosSets;

    readonly allNumsSet: ReadonlySudokuNumsSet;

    readonly combosLut: PowersOf2Lut<Combo>;
    readonly combosNumsSetLut: PowersOf2Lut<ReadonlySudokuNumsSet>;

    readonly combosByNum: ReadonlyArray<ReadonlyCombos>;

    private readonly _bitStore32ToComboMap: Map<BitStore32, Combo> = new Map();
    private readonly _bitStore32ToIndex: Map<BitStore32, number> = new Map();

    /**
     * Constucts new combinations of unique numbers to form a sum.
     *
     * @param val - Array of combinations of unique numbers to form a sum.
     */
    constructor(val: ReadonlyCombos) {
        this.val = val;
        let index = 0;
        const allNumsSet = SudokuNumsSet.newEmpty();
        for (const combo of val) {
            this._bitStore32ToComboMap.set(combo.numsSet.bitStore, combo);
            this._bitStore32ToIndex.set(combo.numsSet.bitStore, index++);
            allNumsSet.addAll(combo.numsSet);
        }
        this.allNumsSet = allNumsSet;
        this.perms = val.map(combo => [ combo ]);
        this.arrayedVal = [ val ];
        this.combosSet = CombosSet.from(this, val);
        this.combosSets = [ this.combosSet ];
        this.combosLut = new PowersOf2Lut();
        this.combosNumsSetLut = new PowersOf2Lut();
        val.forEach((combo, index) => {
            this.combosLut.set(index, combo);
            this.combosNumsSetLut.set(index, combo.numsSet);
        });
        this.combosByNum = SumCombos.newCombosByNum(val);
    }

    private static newCombosByNum(val: ReadonlyCombos) {
        const combosByNum: Array<Array<Combo>> = CachedNumRanges.ZERO_TO_N_LTE_81[SudokuNumsSet.MAX_NUM + 1].map(() => []);
        for (const combo of val) {
            for (const num of combo.numsSet.nums) {
                combosByNum[num].push(combo);
            }
        }
        return combosByNum;
    }

    /**
     * Returns specific combination of unique numbers to form a sum by {@link ReadonlySudokuNumsSet}
     * if it is present amongst registered combinations.
     *
     * @param numsSet - Set of unique Sudoku numbers between 1 and 9 to look up {@link Combo} by.
     *
     * @returns Specific combination of unique numbers to form a sum by {@link ReadonlySudokuNumsSet}
     * if it is present amongst registered combinations; otherwise returns `undefined`.
     */
    get(numsSet: ReadonlySudokuNumsSet) {
        return this._bitStore32ToComboMap.get(numsSet.bitStore);
    }

    optimisticGetByBits(val: BitStore32) {
        return this._bitStore32ToComboMap.get(val) as Combo;
    }

    indexOf(combo: Combo): number | undefined {
        return this._bitStore32ToIndex.get(combo.numsSet.bitStore);
    }

    optimisticIndexOf(combo: Combo): number {
        return this._bitStore32ToIndex.get(combo.numsSet.bitStore) as number;
    }

    /**
     * Determines combinations of unique numbers (addends) to form a sum using precomputed values.
     *
     * Sample usage:
     * ```ts
     * const combosOf2NumbersToAddUpTo7 = SumCombos.combosForSum(7, 2); // [ Combo.of(1, 6), Combo.of(2, 5), Combo.of(3, 4) ]
     * const combosOf7NumbersToAddUpTo30 = SumCombos.combosForSum(30, 7); // [ Combo.of(1, 2, 3, 4, 5, 6, 9), Combo.of(1, 2, 3, 4, 5, 7, 8) ]
     * const combosOf2NumbersToAddUpTo19 = SumCombos.combosForSum(19, 2); // []
     * ```
     *
     * @param sum - Sum to find addend combinations for. Should be within [1, 45] range.
     * @param addendCount - Amount of unique numbers to form a sum. Should be within [1, 9] range.
     *
     * @returns Readonly array of distinct combinations of unique numbers (addends) to form a sum.
     * If there are no combinations found, empty array is returned.
     *
     * @throws {RangeError} if the sum or the amount of unique numbers to form a sum is out of range.
     */
    static enumerate(sum: number, addendCount: number): SumCombos {
        validate(sum, addendCount);

        const key = precomputeKey(sum, addendCount);
        return PRECOMPUTED.get(key) as SumCombos;
    }

    static readonly MAX_SUM_OF_CAGE_3 = 24;

}

const precomputeKey = (sum: number, numCount: number) => {
    return Math.imul(numCount, 100) + sum;
};

const storePrecomputed = (source: string, numCount: number) => {
    const lines = source.split(EOL).filter(line => line.trim().length > 0);
    for (const line of lines) {
        const sumAndCombos = line.split(': ');
        const sum = parseInt(sumAndCombos[0].trim());
        const combos = new Array<Combo>();
        for (const combosStr of sumAndCombos[1].split(' ')) {
            const comboNumbers = new Array<number>();
            for (const char of combosStr.trim()) {
                comboNumbers.push(parseInt(char));
            }
            const combo = Combo.of(...comboNumbers);
            // ALL_COMBOS[new SudokuNumsSet(comboNumbers).bitStore] = combo;
            combos.push(combo);
        }
        PRECOMPUTED.set(precomputeKey(sum, numCount), new SumCombos(combos));
    }

    _.range(SudokuNumsSet.MIN_NUM, House.SUM + 1).forEach(sum => {
        const key = precomputeKey(sum, numCount);
        if (!PRECOMPUTED.has(key)) {
            PRECOMPUTED.set(key, EMPTY_SUM_COMBO);
        }
    });
};

const PRECOMPUTED = new Map<PrecomputeComboKey, SumCombos>();

const EMPTY_SUM_COMBO = new SumCombos([]);

storePrecomputed(`
    1: 1
    2: 2
    3: 3
    4: 4
    5: 5
    6: 6
    7: 7
    8: 8
    9: 9
`, 1);

storePrecomputed(`
     3: 12
     4: 13
     5: 14 23
     6: 15 24
     7: 16 25 34
     8: 17 26 35
     9: 18 27 36 45
    10: 19 28 37 46
    11: 29 38 47 56
    12: 39 48 57
    13: 49 58 67
    14: 59 68
    15: 69 78
    16: 79
    17: 89
`, 2);

storePrecomputed(`
     6: 123
     7: 124
     8: 125 134
     9: 126 135 234
    10: 127 136 145 235
    11: 128 137 146 236 245
    12: 129 138 147 156 237 246 345
    13: 139 148 157 238 247 256 346
    14: 149 158 167 239 248 257 347 356
    15: 159 168 249 258 267 348 357 456
    16: 169 178 259 268 349 358 367 457
    17: 179 269 278 359 368 458 467
    18: 189 279 369 378 459 468 567
    19: 289 379 469 478 568
    20: 389 479 569 578
    21: 489 579 678
    22: 589 679
    23: 689
    24: 789
`, 3);

storePrecomputed(`
    10: 1234
    11: 1235
    12: 1236 1245
    13: 1237 1246 1345
    14: 1238 1247 1256 1346 2345
    15: 1239 1248 1257 1347 1356 2346
    16: 1249 1258 1267 1348 1357 1456 2347 2356
    17: 1259 1268 1349 1358 1367 1457 2348 2357 2456
    18: 1269 1278 1359 1368 1458 1467 2349 2358 2367 2457 3456
    19: 1279 1369 1378 1459 1468 1567 2359 2368 2458 2467 3457
    20: 1289 1379 1469 1478 1568 2369 2378 2459 2468 2567 3458 3467
    21: 1389 1479 1569 1578 2379 2469 2478 2568 3459 3468 3567
    22: 1489 1579 1678 2389 2479 2569 2578 3469 3478 3568 4567
    23: 1589 1679 2489 2579 2678 3479 3569 3578 4568
    24: 1689 2589 2679 3489 3579 3678 4569 4578
    25: 1789 2689 3589 3679 4579 4678
    26: 2789 3689 4589 4679 5678
    27: 3789 4689 5679
    28: 4789 5689
    29: 5789
    30: 6789
`, 4);

storePrecomputed(`
    15: 12345
    16: 12346
    17: 12347 12356
    18: 12348 12357 12456
    19: 12349 12358 12367 12457 13456
    20: 12359 12368 12458 12467 13457 23456
    21: 12369 12378 12459 12468 12567 13458 13467 23457
    22: 12379 12469 12478 12568 13459 13468 13567 23458 23467
    23: 12389 12479 12569 12578 13469 13478 13568 14567 23459 23468 23567
    24: 12489 12579 12678 13479 13569 13578 14568 23469 23478 23568 24567
    25: 12589 12679 13489 13579 13678 14569 14578 23479 23569 23578 24568 34567
    26: 12689 13589 13679 14579 14678 23489 23579 23678 24569 24578 34568
    27: 12789 13689 14589 14679 15678 23589 23679 24579 24678 34569 34578
    28: 13789 14689 15679 23689 24589 24679 25678 34579 34678
    29: 14789 15689 23789 24689 25679 34589 34679 35678
    30: 15789 24789 25689 34689 35679 45678
    31: 16789 25789 34789 35689 45679
    32: 26789 35789 45689
    33: 36789 45789
    34: 46789
    35: 56789
`, 5);

storePrecomputed(`
    21: 123456
    22: 123457
    23: 123458 123467
    24: 123459 123468 123567
    25: 123469 123478 123568 124567
    26: 123479 123569 123578 124568 134567
    27: 123489 123579 123678 124569 124578 134568 234567
    28: 123589 123679 124579 124678 134569 134578 234568
    29: 123689 124589 124679 125678 134579 134678 234569 234578
    30: 123789 124689 125679 134589 134679 135678 234579 234678
    31: 124789 125689 134689 135679 145678 234589 234679 235678
    32: 125789 134789 135689 145679 234689 235679 245678
    33: 126789 135789 145689 234789 235689 245679 345678
    34: 136789 145789 235789 245689 345679
    35: 146789 236789 245789 345689
    36: 156789 246789 345789
    37: 256789 346789
    38: 356789
    39: 456789
`, 6);

storePrecomputed(`
    28: 1234567
    29: 1234568
    30: 1234569 1234578
    31: 1234579 1234678
    32: 1234589 1234679 1235678
    33: 1234689 1235679 1245678
    34: 1234789 1235689 1245679 1345678
    35: 1235789 1245689 1345679 2345678
    36: 1236789 1245789 1345689 2345679
    37: 1246789 1345789 2345689
    38: 1256789 1346789 2345789
    39: 1356789 2346789
    40: 1456789 2356789
    41: 2456789
    42: 3456789
`, 7);

storePrecomputed(`
    36: 12345678
    37: 12345679
    38: 12345689
    39: 12345789
    40: 12346789
    41: 12356789
    42: 12456789
    43: 13456789
    44: 23456789
`, 8);

storePrecomputed(`
    45: 123456789
`, 9);

const validate = (sum: number, numCount: number) => {
    if (sum < SudokuNumsSet.MIN_NUM || sum > House.SUM) {
        throw new RangeError(`Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: ${sum}`);
    }
    if (numCount < 1 || numCount > House.CELL_COUNT) {
        throw new RangeError(`Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: ${numCount}`);
    }
};

const MIN_SUMS_PER_NUM_COUNT = new Array(House.CELL_COUNT);
const MAX_SUMS_PER_NUM_COUNT = new Array(House.CELL_COUNT);
_.range(House.CELL_COUNT).forEach((count: number) => {
    if (count == 0) {
        MIN_SUMS_PER_NUM_COUNT[count] = 1;
        MAX_SUMS_PER_NUM_COUNT[count] = House.CELL_COUNT;
    } else {
        MIN_SUMS_PER_NUM_COUNT[count] = MIN_SUMS_PER_NUM_COUNT[count - 1] + (count + 1);
        MAX_SUMS_PER_NUM_COUNT[count] = MAX_SUMS_PER_NUM_COUNT[count - 1] + (House.CELL_COUNT - count);
    }
});
