import * as _ from 'lodash';
import { House } from '../../puzzle/house';
import { Numbers } from '../../puzzle/numbers';
import { Combo, ReadonlyCombos } from './combo';

export function combosForSum(sum: number, numCount: number): ReadonlyCombos {
    if (sum < Numbers.MIN || sum > House.SUM) {
        throw `Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: ${sum}`;
    }
    if (numCount < 1 || numCount > House.CELL_COUNT) {
        throw `Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: ${numCount}`;
    }
    if (sum < MIN_SUMS_PER_COUNT[numCount - 1] || sum > MAX_SUMS_PER_COUNT[numCount - 1]) {
        return [];
    }

    const key = cacheKey(sum, numCount);

    if (CACHE.has(key)) {
        return CACHE.get(key) as ReadonlyCombos;
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

    CACHE.set(key, combos);

    return combos;
}

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

const cacheKey = (sum: number, numCount: number) => {
    return `${sum}_${numCount}`;
};

const CACHE = new Map<string, ReadonlyCombos>();
