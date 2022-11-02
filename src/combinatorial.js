import _ from 'lodash';
import { GRID_SIDE_LENGTH } from './problem';

const MIN_SUMS_PER_COUNT = new Array(GRID_SIDE_LENGTH);
const MAX_SUMS_PER_COUNT = new Array(GRID_SIDE_LENGTH);
_.range(0, GRID_SIDE_LENGTH).forEach(count => {
    if (count == 0) {
        MIN_SUMS_PER_COUNT[count] = 1;
        MAX_SUMS_PER_COUNT[count] = GRID_SIDE_LENGTH;
    } else {
        MIN_SUMS_PER_COUNT[count] = MIN_SUMS_PER_COUNT[count - 1] + (count + 1);
        MAX_SUMS_PER_COUNT[count] = MAX_SUMS_PER_COUNT[count - 1] + (GRID_SIDE_LENGTH - count);
    }
})

export function findCombinationsForSum(sum, count) {
    if (typeof (sum) !== "number" || !sum || sum <= 0) {
        throw `Invalid sum: ${sum}`;
    }
    if (typeof (count) !== "number" || !count || count <= 0) {
        throw `Invalid count: ${count}`;
    }
    if (sum < MIN_SUMS_PER_COUNT[count - 1] || sum > MAX_SUMS_PER_COUNT[count - 1]) {
        return [];
    }

    const combos = [];
    const digits = new Array(count);
    let currentSum = 0;

    function combosRecursive(level, startWith) {
        if (level > count) {
            if (currentSum === sum) {
                combos.push(new Set(digits));
            }
        } else {
            for (let i = startWith; i <= GRID_SIDE_LENGTH; ++i) {
                if (currentSum + i > sum) {
                    return;
                } else {
                    digits[level - 1] = i;
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

export function findCombinationsForSegment(sums) {
    const combos = [];
    const combosForSums = sums.map(sum => findCombinationsForSum(sum.value, sum.cellCount));
    const stack = new Array(sums.length);
    const checkingSet = new Set();

    function combosRecursive(step) {
        if (step === sums.length) {
            combos.push([...stack]);
        } else {
            const combosForSum = combosForSums[step];
            for (const comboForSum of combosForSum) {
                const comboForSumArr = [...comboForSum];
                if (comboForSumArr.every(digit => !checkingSet.has(digit))) {
                    stack[step] = comboForSum;

                    comboForSumArr.forEach(digit => checkingSet.add(digit));
                    combosRecursive(step + 1);    
                    comboForSumArr.forEach(digit => checkingSet.delete(digit));
                }
            }
        }
    }

    combosRecursive(0);

    return combos;
}
