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

    const sets = [];
    const digits = new Array(count);
    let currentSum = 0;

    function combinationsRecursive(level, startWith) {
        if (level > count) {
            if (currentSum === sum) {
                sets.push(new Set(digits));
            }
        } else {
            for (let i = startWith; i <= GRID_SIDE_LENGTH; ++i) {
                if (currentSum + i > sum) {
                    return;
                } else {
                    digits[level - 1] = i;
                    currentSum += i;
                    combinationsRecursive(level + 1, i + 1);
                    currentSum -= i;
                }
            }
        }
    }

    combinationsRecursive(1, 1);

    return sets;
}

export function findCombinationsForSegment(sums) {
    const combos = [];
    const combinationsForSums = sums.map(
        sum => findCombinationsForSum(sum.value, sum.cellCount));
    const uniqueDigitsCount = sums.reduce(
        (partialSum, a) => partialSum + a.cellCount, 0);

    const stack = [];
    stack.length = sums.length;

    function recursiveCombos(step) {
        if (step === sums.length) {
            const uniqueDigits = new Set(stack.map(set => Array.from(set)).flatMap(digit => digit));
            if (uniqueDigits.size === uniqueDigitsCount) {
                combos.push([...stack]);
            }
        } else {
            const combinationsForSum = combinationsForSums[step];
            for (const combinationForSum of combinationsForSum) {
                stack[step] = combinationForSum;
                recursiveCombos(step + 1);
            }
        }
    }

    recursiveCombos(0);

    return combos;
}
