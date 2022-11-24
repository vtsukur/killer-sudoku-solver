import _ from 'lodash';
import { House } from '../../problem/house';
import { valuesForMsg } from '../../util/readableMessages';

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

export function findNumCombinationsForSum(sum, count) {
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

export function findSumCombinationsForHouse(houseModel) {
    if (typeof(houseModel) !== 'object' || !houseModel) {
        throw `Invalid houseModel: ${houseModel}`;
    }

    const cages = houseModel.cages;
    if (!Array.isArray(cages)) {
        throw `Invalid cages: ${cages}`;
    }

    const cells = houseModel.cells;
    if (!Array.isArray(cells)) {
        throw `Invalid cells: ${cells}`;
    }

    const { nonOverlappingCages, overlappingCages } = clusterCagesByOverlap(cages, cells);

    const combosForNonOverlappingCages = doFindForNonOverlappingCages(nonOverlappingCages);
    const combosForOverlappingCages = doFindForOverlappingCages(overlappingCages);
    const combinedCombos = merge(combosForNonOverlappingCages, combosForOverlappingCages);
    const preservedCageOrderCombos = preserveOrder(combinedCombos, houseModel, nonOverlappingCages, overlappingCages);

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
        cellsToCagesMap.set(cell.key, new Set());
    })
    cages.forEach(cage => {
        cage.cells.forEach(cell => {
            cellsToCagesMap.get(cell.key).add(cage);
        });
    });

    const allCagesAreNonOverlapping = Array.from(cellsToCagesMap.values()).every(cageSet => cageSet.size === 1);
    if (allCagesAreNonOverlapping) {
        nonOverlappingCages = [...cages];
    } else {
        const maxNonOverlappingCagesAreaModelSet = findMaxNonOverlappingCagesArea(cages, absMaxAreaCellCount);
        cages.forEach(cage => {
            if (maxNonOverlappingCagesAreaModelSet.has(cage)) {
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

// there is an issue with it having single cells ommitted sometimes + we can add cages with non-overlapping cells ahead of time to reduce computational overhead
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

    const noOverlap = cage.cells.every(cell => !context.areaCellKeysStack.has(cell.key));
    if (!noOverlap) return;

    context.cagesStack.add(cage);
    context.remainingCagesStack.delete(cage);
    cage.cells.forEach(cell => context.areaCellKeysStack.add(cell.key));
    context.cellCount += cage.cellCount;

    if (context.cellCount >= context.absMaxAreaCellCount ||
        (context.cellCount <= context.absMaxAreaCellCount && context.cellCount > context.maxAreaCellCount)) {
        context.maxAreaSet = new Set(context.cagesStack);
        context.maxAreaCellCount = context.cellCount;
    }

    const nextCage = context.remainingCagesStack.values().next().value;
    findBiggestNonOverlappingCagesAreaRecursive(nextCage, context);

    context.cellCount -= cage.cellCount;
    cage.cells.forEach(cell => context.areaCellKeysStack.delete(cell.key));
    context.remainingCagesStack.add(cage);
    context.cagesStack.delete(cage);
}

function doFindForNonOverlappingCages(cages) {
    const totalSum = cages.reduce((partialSum, a) => partialSum + a.sum, 0);
    if (totalSum > House.SUM) {
        throw `Total cage with non-overlapping cells should be <= ${House.SUM}. Actual: ${totalSum}. Cages: {${valuesForMsg(cages)}}`;
    }
    if (cages.length == 0) {
        return [];
    }

    const combos = [];
    const combosForCages = cages.map(cage => findNumCombinationsForSum(cage.sum, cage.cellCount));
    const stack = new Array(cages.length);
    const checkingSet = new Set();

    function combosRecursive(step) {
        if (step === cages.length) {
            combos.push([...stack]);
        } else {
            const combosForSum = combosForCages[step];
            for (const comboForSum of combosForSum) {
                const comboForSumArr = [...comboForSum];
                if (comboForSumArr.every(num => !checkingSet.has(num))) {
                    stack[step] = comboForSum;

                    comboForSumArr.forEach(num => checkingSet.add(num));
                    combosRecursive(step + 1);    
                    comboForSumArr.forEach(num => checkingSet.delete(num));
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
    const combosForCages = cages.map(cage => findNumCombinationsForSum(cage.sum, cage.cellCount));
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

function preserveOrder(combinedCombos, houseModel, nonOverlappingCages, overlappingCages) {
    if (overlappingCages.length === 0) {
        return combinedCombos;
    }
    else {
        const orderPreservedCombos = [];

        const cageIndexResolvers = new Array(houseModel.cages.length);
        nonOverlappingCages.forEach((cage, idx) => {
            cageIndexResolvers[idx] = houseModel.cages.findIndex(originalCage => originalCage === cage);
        });
        overlappingCages.forEach((cage, idx) => {
            cageIndexResolvers[nonOverlappingCages.length + idx] = houseModel.cages.findIndex(originalCage => originalCage === cage);
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
