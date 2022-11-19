import _ from 'lodash';
import { UNIQUE_SEGMENT_COUNT, UNIQUE_SEGMENT_LENGTH, UNIQUE_SEGMENT_SUM } from '../problem/constants';

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

export function findNumberCombinationsForSum(cage, count) {
    if (typeof (cage) !== 'number' || !cage || cage <= 0) {
        throw `Invalid cage: ${cage}`;
    }
    if (typeof (count) !== 'number' || !count || count <= 0) {
        throw `Invalid count: ${count}`;
    }
    if (cage < MIN_SUMS_PER_COUNT[count - 1] || cage > MAX_SUMS_PER_COUNT[count - 1]) {
        return [];
    }

    const combos = [];
    const numbers = new Array(count);
    let currentSum = 0;

    function combosRecursive(level, startWith) {
        if (level > count) {
            if (currentSum === cage) {
                combos.push(new Set(numbers));
            }
        } else {
            for (let i = startWith; i <= UNIQUE_SEGMENT_LENGTH; ++i) {
                if (currentSum + i > cage) {
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

    const cages = segment.cages;
    if (!Array.isArray(cages)) {
        throw `Invalid cages: ${cages}`;
    }

    const cells = segment.cells;
    if (!Array.isArray(cells)) {
        throw `Invalid cells: ${cells}`;
    }

    const { nonOverlappingSums, overlappingSums } = clusterSumsByOverlap(cages, cells);

    const combosForNonOverlappingSums = doFindForNonOverlappingSums(nonOverlappingSums);
    const combosForOverlappingSums = doFindForOverlappingSums(overlappingSums);
    const combinedCombos = merge(combosForNonOverlappingSums, combosForOverlappingSums);
    const preservedSumOrderCombos = preserveOrder(combinedCombos, segment, nonOverlappingSums, overlappingSums);

    return preservedSumOrderCombos;
}

export function clusterSumsByOverlap(cages, cells, absMaxAreaCellCount = UNIQUE_SEGMENT_COUNT) {
    if (!cages.length) {
        return { nonOverlappingSums: [], overlappingSums: [] };
    }

    let nonOverlappingSums = [];
    const overlappingSums = [];

    const cellsToSumsMap = new Map();
    cells.forEach(cell => {
        cellsToSumsMap.set(cell.key(), new Set());
    })
    cages.forEach(cage => {
        cage.cells.forEach(cell => {
            cellsToSumsMap.get(cell.key()).add(cage);
        });
    });

    const allSumsAreNonOverlapping = Array.from(cellsToSumsMap.values()).every(cageSet => cageSet.size === 1);
    if (allSumsAreNonOverlapping) {
        nonOverlappingSums = [...cages];
    } else {
        const maxNonOverlappingSumAreaSet = findMaxNonOverlappingSumArea(cages, absMaxAreaCellCount);
        cages.forEach(cage => {
            if (maxNonOverlappingSumAreaSet.has(cage)) {
                nonOverlappingSums.push(cage);
            } else {
                overlappingSums.push(cage);
            }
        });    
    }

    return {
        nonOverlappingSums,
        overlappingSums
    };
}

function findMaxNonOverlappingSumArea(cages, absMaxAreaCellCount) {
    const context = {
        allSumsSet: new Set(cages),
        maxAreaSet: new Set(),
        maxAreaCellCount: 0,
        cellCount: 0,
        cagesStack: new Set(),
        remainingSumsStack: new Set(cages),
        overlappingSumsStack: new Set(),
        areaCellKeysStack: new Set(),
        absMaxAreaCellCount: absMaxAreaCellCount
    };

    cages.forEach(cage => {
        findBiggestNonOverlappingSumAreaRecursive(cage, context);
    });

    return context.maxAreaSet;
}

function findBiggestNonOverlappingSumAreaRecursive(cage, context) {
    if (context.maxAreaCellCount >= context.absMaxAreaCellCount || !cage) {
        return;
    }

    const noOverlap = cage.cells.every(cell => !context.areaCellKeysStack.has(cell.key()));
    if (!noOverlap) return;

    context.cagesStack.add(cage);
    context.remainingSumsStack.delete(cage);
    cage.cells.forEach(cell => context.areaCellKeysStack.add(cell.key()));
    context.cellCount += cage.cellCount;

    if (context.cellCount >= context.absMaxAreaCellCount ||
        (context.cellCount <= context.absMaxAreaCellCount && context.cellCount > context.maxAreaCellCount)) {
        context.maxAreaSet = new Set(context.cagesStack);
        context.maxAreaCellCount = context.cellCount;
    }

    const nextSum = context.remainingSumsStack.values().next().value;
    findBiggestNonOverlappingSumAreaRecursive(nextSum, context);

    context.cellCount -= cage.cellCount;
    cage.cells.forEach(cell => context.areaCellKeysStack.delete(cell.key()));
    context.remainingSumsStack.add(cage);
    context.cagesStack.delete(cage);
}

function doFindForNonOverlappingSums(cages) {
    if (cages.length > UNIQUE_SEGMENT_LENGTH) {
        throw `Too many cages with non-overlapping cells. Expected no more than ${UNIQUE_SEGMENT_LENGTH} cages. Actual: ${cages.length})`;
    }
    const totalSum = cages.reduce((partialSum, a) => partialSum + a.value, 0);
    if (totalSum > UNIQUE_SEGMENT_SUM) {
        throw `Total cage with non-overlapping cells should be <= ${UNIQUE_SEGMENT_SUM}. Actual: ${totalSum}. Sums: {${cages.join(', ')}}`;
    }
    const cellCount = cages.reduce((partialSum, a) => partialSum + a.cellCount, 0);
    if (cellCount > UNIQUE_SEGMENT_LENGTH) {
        throw `Too many cells in cages with non-overlapping cells. Expected no more than ${UNIQUE_SEGMENT_LENGTH} cells. Actual: ${cellCount})`;
    }
    if (cages.length == 0) {
        return [];
    }

    const combos = [];
    const combosForSums = cages.map(cage => findNumberCombinationsForSum(cage.value, cage.cellCount));
    const stack = new Array(cages.length);
    const checkingSet = new Set();

    function combosRecursive(step) {
        if (step === cages.length) {
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

function doFindForOverlappingSums(cages) {
    if (cages.length === 0) return [];

    const combos = [];
    const combosForSums = cages.map(cage => findNumberCombinationsForSum(cage.value, cage.cellCount));
    const stack = new Array(cages.length);

    function combosRecursive(step) {
        if (step === cages.length) {
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

        const cageIndexResolvers = new Array(segment.cages.length);
        nonOverlappingSums.forEach((cage, idx) => {
            cageIndexResolvers[idx] = segment.cages.findIndex(originalSum => originalSum === cage);
        });
        overlappingSums.forEach((cage, idx) => {
            cageIndexResolvers[nonOverlappingSums.length + idx] = segment.cages.findIndex(originalSum => originalSum === cage);
        });
        combinedCombos.forEach(comboSets => {
            const preservedOrderCombo = new Array(comboSets.length);
            comboSets.forEach((numbersSet, idx) => {
                preservedOrderCombo[cageIndexResolvers[idx]] = numbersSet;
            });
            orderPreservedCombos.push(preservedOrderCombo);
        });
        
        return orderPreservedCombos;
    }
}
