import _ from 'lodash';
import { House } from '../problem/house';

const MIN_SUMS_PER_COUNT = new Array(House.SIZE);
const MAX_SUMS_PER_COUNT = new Array(House.SIZE);
_.range(House.SIZE).forEach(count => {
    if (count == 0) {
        MIN_SUMS_PER_COUNT[count] = 1;
        MAX_SUMS_PER_COUNT[count] = House.SIZE;
    } else {
        MIN_SUMS_PER_COUNT[count] = MIN_SUMS_PER_COUNT[count - 1] + (count + 1);
        MAX_SUMS_PER_COUNT[count] = MAX_SUMS_PER_COUNT[count - 1] + (House.SIZE - count);
    }
})

export function findNumberCombinationsForSum(sum, count) {
    if (typeof (sum) !== 'number' || !sum || sum <= 0) {
        throw `Invalid cage: ${sum}`;
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
            for (let i = startWith; i <= House.SIZE; ++i) {
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

    const cages = segment.cages;
    if (!Array.isArray(cages)) {
        throw `Invalid cages: ${cages}`;
    }

    const cells = segment.cells;
    if (!Array.isArray(cells)) {
        throw `Invalid cells: ${cells}`;
    }

    const { nonOverlappingCages, overlappingCages } = clusterCagesByOverlap(cages, cells);

    const combosForNonOverlappingCages = doFindForNonOverlappingCages(nonOverlappingCages);
    const combosForOverlappingCages = doFindForOverlappingCages(overlappingCages);
    const combinedCombos = merge(combosForNonOverlappingCages, combosForOverlappingCages);
    const preservedCageOrderCombos = preserveOrder(combinedCombos, segment, nonOverlappingCages, overlappingCages);

    return preservedCageOrderCombos;
}

export function clusterCagesByOverlap(cages, cells, absMaxAreaCellCount = House.SIZE) {
    if (!cages.length) {
        return { nonOverlappingCages: [], overlappingCages: [] };
    }

    let nonOverlappingCages = [];
    const overlappingCages = [];

    const cellsToCagesMap = new Map();
    cells.forEach(cell => {
        cellsToCagesMap.set(cell.key(), new Set());
    })
    cages.forEach(cage => {
        cage.cells.forEach(cell => {
            cellsToCagesMap.get(cell.key()).add(cage);
        });
    });

    const allCagesAreNonOverlapping = Array.from(cellsToCagesMap.values()).every(cageSet => cageSet.size === 1);
    if (allCagesAreNonOverlapping) {
        nonOverlappingCages = [...cages];
    } else {
        const maxNonOverlappingCagesAreaSet = findMaxNonOverlappingCagesArea(cages, absMaxAreaCellCount);
        cages.forEach(cage => {
            if (maxNonOverlappingCagesAreaSet.has(cage)) {
                nonOverlappingCages.push(cage);
            } else {
                overlappingCages.push(cage);
            }
        });    
    }

    return {
        nonOverlappingCages,
        overlappingCages
    };
}

function findMaxNonOverlappingCagesArea(cages, absMaxAreaCellCount) {
    const context = {
        allCagesSet: new Set(cages),
        maxAreaSet: new Set(),
        maxAreaCellCount: 0,
        cellCount: 0,
        cagesStack: new Set(),
        remainingCagesStack: new Set(cages),
        overlappingCagesStack: new Set(),
        areaCellKeysStack: new Set(),
        absMaxAreaCellCount: absMaxAreaCellCount
    };

    cages.forEach(cage => {
        findBiggestNonOverlappingCagesAreaRecursive(cage, context);
    });

    return context.maxAreaSet;
}

function findBiggestNonOverlappingCagesAreaRecursive(cage, context) {
    if (context.maxAreaCellCount >= context.absMaxAreaCellCount || !cage) {
        return;
    }

    const noOverlap = cage.cells.every(cell => !context.areaCellKeysStack.has(cell.key()));
    if (!noOverlap) return;

    context.cagesStack.add(cage);
    context.remainingCagesStack.delete(cage);
    cage.cells.forEach(cell => context.areaCellKeysStack.add(cell.key()));
    context.cellCount += cage.cellCount;

    if (context.cellCount >= context.absMaxAreaCellCount ||
        (context.cellCount <= context.absMaxAreaCellCount && context.cellCount > context.maxAreaCellCount)) {
        context.maxAreaSet = new Set(context.cagesStack);
        context.maxAreaCellCount = context.cellCount;
    }

    const nextCage = context.remainingCagesStack.values().next().value;
    findBiggestNonOverlappingCagesAreaRecursive(nextCage, context);

    context.cellCount -= cage.cellCount;
    cage.cells.forEach(cell => context.areaCellKeysStack.delete(cell.key()));
    context.remainingCagesStack.add(cage);
    context.cagesStack.delete(cage);
}

function doFindForNonOverlappingCages(cages) {
    if (cages.length > House.SIZE) {
        throw `Too many cages with non-overlapping cells. Expected no more than ${House.SIZE} cages. Actual: ${cages.length})`;
    }
    const totalSum = cages.reduce((partialSum, a) => partialSum + a.value, 0);
    if (totalSum > House.SUM) {
        throw `Total cage with non-overlapping cells should be <= ${House.SUM}. Actual: ${totalSum}. Cages: {${cages.join(', ')}}`;
    }
    const cellCount = cages.reduce((partialSum, a) => partialSum + a.cellCount, 0);
    if (cellCount > House.SIZE) {
        throw `Too many cells in cages with non-overlapping cells. Expected no more than ${House.SIZE} cells. Actual: ${cellCount})`;
    }
    if (cages.length == 0) {
        return [];
    }

    const combos = [];
    const combosForCages = cages.map(cage => findNumberCombinationsForSum(cage.value, cage.cellCount));
    const stack = new Array(cages.length);
    const checkingSet = new Set();

    function combosRecursive(step) {
        if (step === cages.length) {
            combos.push([...stack]);
        } else {
            const combosForSum = combosForCages[step];
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

function doFindForOverlappingCages(cages) {
    if (cages.length === 0) return [];

    const combos = [];
    const combosForCages = cages.map(cage => findNumberCombinationsForSum(cage.value, cage.cellCount));
    const stack = new Array(cages.length);

    function combosRecursive(step) {
        if (step === cages.length) {
            combos.push([...stack]);
        } else {
            const combosForSum = combosForCages[step];
            for (const comboForSum of combosForSum) {
                stack[step] = comboForSum;
                combosRecursive(step + 1);    
            }
        }
    }

    combosRecursive(0);

    return combos;
}

function merge(combosForNonOverlappingCages, combosForOverlappingCages) {
    if (combosForOverlappingCages.length === 0) {
        return combosForNonOverlappingCages;
    }
    else {
        const merged = [];
        combosForNonOverlappingCages.forEach(combosLeft => {
            combosForOverlappingCages.forEach(combosRight => {
                merged.push(combosLeft.concat(combosRight));
            });
        });    
        return merged;
    }
}

function preserveOrder(combinedCombos, segment, nonOverlappingCages, overlappingCages) {
    if (overlappingCages.length === 0) {
        return combinedCombos;
    }
    else {
        const orderPreservedCombos = [];

        const cageIndexResolvers = new Array(segment.cages.length);
        nonOverlappingCages.forEach((cage, idx) => {
            cageIndexResolvers[idx] = segment.cages.findIndex(originalCage => originalCage === cage);
        });
        overlappingCages.forEach((cage, idx) => {
            cageIndexResolvers[nonOverlappingCages.length + idx] = segment.cages.findIndex(originalCage => originalCage === cage);
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
