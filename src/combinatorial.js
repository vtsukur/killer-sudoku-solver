import _ from 'lodash';
import { UNIQUE_SEGMENT_LENGTH, UNIQUE_SEGMENT_SUM } from './problem';

const MIN_SUMS_PER_COUNT = new Array(UNIQUE_SEGMENT_LENGTH);
const MAX_SUMS_PER_COUNT = new Array(UNIQUE_SEGMENT_LENGTH);
_.range(UNIQUE_SEGMENT_LENGTH).forEach(count => {
    if (count == 0) {
        MIN_SUMS_PER_COUNT[count] = 1;
        MAX_SUMS_PER_COUNT[count] = UNIQUE_SEGMENT_LENGTH;
    } else {
        MIN_SUMS_PER_COUNT[count] = MIN_SUMS_PER_COUNT[count - 1] + (count + 1);
        MAX_SUMS_PER_COUNT[count] = MAX_SUMS_PER_COUNT[count - 1] + (UNIQUE_SEGMENT_LENGTH - count);
    }
})

export function findNumberCombinationsForSum(sum, count) {
    if (typeof (sum) !== 'number' || !sum || sum <= 0) {
        throw `Invalid sum: ${sum}`;
    }
    if (typeof (count) !== 'number' || !count || count <= 0) {
        throw `Invalid count: ${count}`;
    }
    if (sum < MIN_SUMS_PER_COUNT[count - 1] || sum > MAX_SUMS_PER_COUNT[count - 1]) {
        return [];
    }

    const combos = [];
    const numbers = new Array(count);
    let currentSum = 0;

    function combosRecursive(level, startWith) {
        if (level > count) {
            if (currentSum === sum) {
                combos.push(new Set(numbers));
            }
        } else {
            for (let i = startWith; i <= UNIQUE_SEGMENT_LENGTH; ++i) {
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

export function findSumCombinationsForSegment(segment) {
    if (typeof(segment) !== 'object' || !segment) {
        throw `Invalid segment: ${segment}`;
    }

    const sums = segment.sums;
    if (!Array.isArray(sums)) {
        throw `Invalid sums: ${sums}`;
    }

    const cells = segment.cells;
    if (!Array.isArray(cells)) {
        throw `Invalid cells: ${cells}`;
    }

    const withinSegmentSums = new Map();
    cells.forEach(cell => {
        withinSegmentSums.set(cell.key(), new Set());
    })
    sums.forEach(sum => {
        sum.cells.forEach(cell => {
            withinSegmentSums.get(cell.key()).add(sum);
        });
    });
    const nonOverlappingSums = [];
    const overlappingSums = [];
    sums.forEach(sum => {
        const allCellsAreWithinMoreThan1Sum = sum.cells.every(cell => withinSegmentSums.get(cell.key()).size > 1);
        (allCellsAreWithinMoreThan1Sum ? overlappingSums : nonOverlappingSums).push(sum);
    });

    const combosForNonOverlappingSums = doFindForNonOverlappingSums(nonOverlappingSums);
    const combosForOverlappingSums = doFindForOverlappingSums(overlappingSums);
    const combinedCombos = merge(combosForNonOverlappingSums, combosForOverlappingSums);

    return combinedCombos;
}

function doFindForNonOverlappingSums(sums) {
    if (sums.length > UNIQUE_SEGMENT_LENGTH) {
        throw `Too many sums with non-overlapping cells. Expected no more than ${UNIQUE_SEGMENT_LENGTH} sums. Actual: ${sums.length})`;
    }
    const totalSum = sums.reduce((partialSum, a) => partialSum + a.value, 0);
    if (totalSum > UNIQUE_SEGMENT_SUM) {
        throw `Total sum with non-overlapping cells should be <= ${UNIQUE_SEGMENT_SUM}. Actual: ${totalSum}. Sums: {${sums.join(', ')}}`;
    }
    const cellCount = sums.reduce((partialSum, a) => partialSum + a.cellCount, 0);
    if (cellCount > UNIQUE_SEGMENT_LENGTH) {
        throw `Too many cells in sums with non-overlapping cells. Expected no more than ${UNIQUE_SEGMENT_LENGTH} cells. Actual: ${cellCount})`;
    }
    if (sums.length == 0) {
        return [];
    }

    const combos = [];
    const combosForSums = sums.map(sum => findNumberCombinationsForSum(sum.value, sum.cellCount));
    const stack = new Array(sums.length);
    const checkingSet = new Set();

    function combosRecursive(step) {
        if (step === sums.length) {
            combos.push([...stack]);
        } else {
            const combosForSum = combosForSums[step];
            for (const comboForSum of combosForSum) {
                const comboForSumArr = [...comboForSum];
                if (comboForSumArr.every(number => !checkingSet.has(number))) {
                    stack[step] = comboForSum;

                    comboForSumArr.forEach(number => checkingSet.add(number));
                    combosRecursive(step + 1);    
                    comboForSumArr.forEach(number => checkingSet.delete(number));
                }
            }
        }
    }

    combosRecursive(0);

    return combos;
}

function doFindForOverlappingSums(sums) {
    return [];
}

function merge(nonOverlappingSums, overlappingSums) {
    return nonOverlappingSums;
}
