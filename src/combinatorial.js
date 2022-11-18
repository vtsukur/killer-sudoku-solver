import _ from 'lodash';
import { UNIQUE_SEGMENT_COUNT, UNIQUE_SEGMENT_LENGTH, UNIQUE_SEGMENT_SUM } from './problem';

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

    const { nonOverlappingSums, overlappingSums } = clusterSumsByOverlap(sums, cells);

    const combosForNonOverlappingSums = doFindForNonOverlappingSums(nonOverlappingSums);
    const combosForOverlappingSums = doFindForOverlappingSums(overlappingSums);
    const combinedCombos = merge(combosForNonOverlappingSums, combosForOverlappingSums);
    const preservedSumOrderCombos = preserveOrder(combinedCombos, segment, nonOverlappingSums, overlappingSums);

    return preservedSumOrderCombos;
}

export function clusterSumsByOverlap(sums, cells, absMaxAreaCellCount = UNIQUE_SEGMENT_COUNT) {
    if (!sums.length) {
        return { nonOverlappingSums: [], overlappingSums: [] };
    }

    let nonOverlappingSums = [];
    const overlappingSums = [];

    const cellsToSumsMap = new Map();
    cells.forEach(cell => {
        cellsToSumsMap.set(cell.key(), new Set());
    })
    sums.forEach(sum => {
        sum.cells.forEach(cell => {
            cellsToSumsMap.get(cell.key()).add(sum);
        });
    });

    const allSumsAreNonOverlapping = Array.from(cellsToSumsMap.values()).every(sumSet => sumSet.size === 1);
    if (allSumsAreNonOverlapping) {
        nonOverlappingSums = [...sums];
    } else {
        const maxNonOverlappingSumAreaSet = findMaxNonOverlappingSumArea(sums, absMaxAreaCellCount);
        sums.forEach(sum => {
            if (maxNonOverlappingSumAreaSet.has(sum)) {
                nonOverlappingSums.push(sum);
            } else {
                overlappingSums.push(sum);
            }
        });    
    }

    return {
        nonOverlappingSums,
        overlappingSums
    };
}

function findMaxNonOverlappingSumArea(sums, absMaxAreaCellCount) {
    const context = {
        allSumsSet: new Set(sums),
        maxAreaSet: new Set(),
        maxAreaCellCount: 0,
        cellCount: 0,
        sumsStack: new Set(),
        remainingSumsStack: new Set(sums),
        overlappingSumsStack: new Set(),
        areaCellKeysStack: new Set(),
        absMaxAreaCellCount: absMaxAreaCellCount
    };

    sums.forEach(sum => {
        findBiggestNonOverlappingSumAreaRecursive(sum, context);
    });

    return context.maxAreaSet;
}

function findBiggestNonOverlappingSumAreaRecursive(sum, context) {
    if (context.maxAreaCellCount >= context.absMaxAreaCellCount || !sum) {
        return;
    }

    const noOverlap = sum.cells.every(cell => !context.areaCellKeysStack.has(cell.key()));
    if (!noOverlap) return;

    context.sumsStack.add(sum);
    context.remainingSumsStack.delete(sum);
    sum.cells.forEach(cell => context.areaCellKeysStack.add(cell.key()));
    context.cellCount += sum.cellCount;

    if (context.cellCount >= context.absMaxAreaCellCount ||
        (context.cellCount <= context.absMaxAreaCellCount && context.cellCount > context.maxAreaCellCount)) {
        context.maxAreaSet = new Set(context.sumsStack);
        context.maxAreaCellCount = context.cellCount;
    }

    const nextSum = context.remainingSumsStack.values().next().value;
    findBiggestNonOverlappingSumAreaRecursive(nextSum, context);

    context.cellCount -= sum.cellCount;
    sum.cells.forEach(cell => context.areaCellKeysStack.delete(cell.key()));
    context.remainingSumsStack.add(sum);
    context.sumsStack.delete(sum);
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
    if (sums.length === 0) return [];

    const combos = [];
    const combosForSums = sums.map(sum => findNumberCombinationsForSum(sum.value, sum.cellCount));
    const stack = new Array(sums.length);

    function combosRecursive(step) {
        if (step === sums.length) {
            combos.push([...stack]);
        } else {
            const combosForSum = combosForSums[step];
            for (const comboForSum of combosForSum) {
                stack[step] = comboForSum;
                combosRecursive(step + 1);    
            }
        }
    }

    combosRecursive(0);

    return combos;
}

function merge(combosForNonOverlappingSums, combosForOverlappingSums) {
    if (combosForOverlappingSums.length === 0) {
        return combosForNonOverlappingSums;
    }
    else {
        const merged = [];
        combosForNonOverlappingSums.forEach(combosLeft => {
            combosForOverlappingSums.forEach(combosRight => {
                merged.push(combosLeft.concat(combosRight));
            });
        });    
        return merged;
    }
}

function preserveOrder(combinedCombos, segment, nonOverlappingSums, overlappingSums) {
    if (overlappingSums.length === 0) {
        return combinedCombos;
    }
    else {
        const orderPreservedCombos = [];

        const sumIndexResolvers = new Array(segment.sums.length);
        nonOverlappingSums.forEach((sum, idx) => {
            sumIndexResolvers[idx] = segment.sums.findIndex(originalSum => originalSum === sum);
        });
        overlappingSums.forEach((sum, idx) => {
            sumIndexResolvers[nonOverlappingSums.length + idx] = segment.sums.findIndex(originalSum => originalSum === sum);
        });
        combinedCombos.forEach(comboSets => {
            const preservedOrderCombo = new Array(comboSets.length);
            comboSets.forEach((numbersSet, idx) => {
                preservedOrderCombo[sumIndexResolvers[idx]] = numbersSet;
            });
            orderPreservedCombos.push(preservedOrderCombo);
        });
        
        return orderPreservedCombos;
    }
}
