import * as _ from 'lodash';
import { EOL } from 'os';
import { House } from '../../puzzle/house';
import { Numbers } from '../../puzzle/numbers';
import { CombinatorialError } from './combinatorialError';
import { Combo, ReadonlyCombos } from './combo';

/**
 * Determines combinations of unique numbers to form a sum using precomputed values.
 *
 * Sample usage:
 * ```ts
 * const combosOf2NumbersToAddUpTo7 = combosForSum(7, 2); // [ Combo.of(1, 6), Combo.of(2, 5), Combo.of(3, 4) ]
 * const combosOf7NumbersToAddUpTo30 = combosForSum(30, 7); // [ Combo.of(1, 2, 3, 4, 5, 6, 9), Combo.of(1, 2, 3, 4, 5, 7, 8) ]
 * const combosOf2NumbersToAddUpTo19 = combosForSum(19, 2); // []
 * ```
 *
 * @param sum - The sum to find combinations for. Should be within [1, 45] range.
 * @param numCount - The amount of unique numbers to form a sum. Should be within [1, 9] range.
 *
 * @returns Readonly array of distinct combinations of unique numbers to form a sum.
 * If there are no combinations found, empty array is returned.
 *
 * @throws {CombinatorialError} if the sum or the amount of unique numbers to form a sum is out of range.
 */
export function combosForSum(sum: number, numCount: number): ReadonlyCombos {
    validate(sum, numCount);

    const key = precomputeKey(sum, numCount);
    if (PRECOMPUTED.has(key)) {
        return PRECOMPUTED.get(key) as ReadonlyCombos;
    } else {
        return [];
    }
}

const precomputeKey = (sum: number, numCount: number) => {
    return `${sum}_${numCount}`;
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
            combos.push(Combo.of(...comboNumbers));
        }
        PRECOMPUTED.set(precomputeKey(sum, numCount), combos);
    }
};

const PRECOMPUTED = new Map<string, ReadonlyCombos>();

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

/**
 * Computes combinations of unique numbers to form a sum by avoiding precomputed values.
 *
 * Sample usage:
 * ```ts
 * const combosOf2NumbersToAddUpTo7 = combosForSum(7, 2); // [ Combo.of(1, 6), Combo.of(2, 5), Combo.of(3, 4) ]
 * const combosOf7NumbersToAddUpTo30 = combosForSum(30, 7); // [ Combo.of(1, 2, 3, 4, 5, 6, 9), Combo.of(1, 2, 3, 4, 5, 7, 8) ]
 * const combosOf2NumbersToAddUpTo19 = combosForSum(19, 2); // []
 * ```
 *
 * @param sum - The sum to find combinations for. Should be within [1, 45] range.
 * @param numCount - The amount of unique numbers to form a sum. Should be within [1, 9] range.
 *
 * @returns Readonly array of distinct combinations of unique numbers to form a sum.
 * If there are no combinations found, empty array is returned.
 *
 * @throws {CombinatorialError} if the sum or the amount of unique numbers to form a sum is out of range.
 */
export function computeComboForSum(sum: number, numCount: number): ReadonlyCombos {
    validate(sum, numCount);

    if (sum < MIN_SUMS_PER_COUNT[numCount - 1] || sum > MAX_SUMS_PER_COUNT[numCount - 1]) {
        return [];
    }

    const combos = new Array<Combo>();
    const numbers = new Array<number>(numCount);
    let currentSum = 0;

    function combosRecursive(level: number, startWith: number) {
        if (level > numCount) {
            if (currentSum === sum) {
                combos.push(Combo.of(...numbers));
            }
        } else {
            for (let i = startWith; i <= House.CELL_COUNT; ++i) {
                if (currentSum + i > sum) {
                    return;
                } else {
                    numbers[level - 1] = i;
                    currentSum += i;
                    combosRecursive(level + 1, i + 1);
                    currentSum -= i;
                }
            }
        }
    }

    combosRecursive(1, 1);

    return combos;
}

const validate = (sum: number, numCount: number) => {
    if (sum < Numbers.MIN || sum > House.SUM) {
        throw new CombinatorialError(`Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: ${sum}`);
    }
    if (numCount < 1 || numCount > House.CELL_COUNT) {
        throw new CombinatorialError(`Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: ${numCount}`);
    }
};

const MIN_SUMS_PER_COUNT = new Array(House.CELL_COUNT);
const MAX_SUMS_PER_COUNT = new Array(House.CELL_COUNT);
_.range(House.CELL_COUNT).forEach((count: number) => {
    if (count == 0) {
        MIN_SUMS_PER_COUNT[count] = 1;
        MAX_SUMS_PER_COUNT[count] = House.CELL_COUNT;
    } else {
        MIN_SUMS_PER_COUNT[count] = MIN_SUMS_PER_COUNT[count - 1] + (count + 1);
        MAX_SUMS_PER_COUNT[count] = MAX_SUMS_PER_COUNT[count - 1] + (House.CELL_COUNT - count);
    }
});
