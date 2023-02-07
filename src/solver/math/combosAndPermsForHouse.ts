import * as _ from 'lodash';
import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { CellKey, CellKeysSet, ReadonlyCells } from '../../puzzle/cell';
import { House } from '../../puzzle/house';
import { joinArray } from '../../util/readableMessages';
import { HouseModel } from '../models/elements/houseModel';
import { Combo, ReadonlyCombos } from './combo';
import { combosForSum, SumCombos } from './combosForSum';
import { FastNumSet } from './fastNumSet';

export class HouseSumCombosAndPerms {
    readonly sumPerms: ReadonlyArray<ReadonlyCombos>;

    constructor(sumPerms: ReadonlyArray<ReadonlyCombos>) {
        this.sumPerms = sumPerms;
    }
}

export function combosAndPermsForHouse(houseM: HouseModel): HouseSumCombosAndPerms {
    const cages = houseM.cageModels.map(cageM => cageM.cage);
    const cells = houseM.cells;

    const { nonOverlappingCages, nonOverlappingCagesCellCount, overlappingCages } = clusterCagesByOverlap(cages, cells);

    const combosForNonOverlappingCages = doFindForNonOverlappingCages(nonOverlappingCages, nonOverlappingCagesCellCount);
    const combosForOverlappingCages = doFindForOverlappingCages(overlappingCages);
    const combinedCombos = merge(combosForNonOverlappingCages, combosForOverlappingCages);
    const preservedCageOrderCombos = preserveOrder(combinedCombos, cages, nonOverlappingCages, overlappingCages);

    return new HouseSumCombosAndPerms(preservedCageOrderCombos);
}

export function clusterCagesByOverlap(cages: ReadonlyCages, cells: ReadonlyCells, absMaxAreaCellCount = House.CELL_COUNT) {
    if (!cages.length) {
        return { nonOverlappingCages: [], nonOverlappingCagesCellCount: 0, overlappingCages: [] };
    }

    const nonOverlappingCages = new Array<Cage>();
    let nonOverlappingCagesCellCount = 0;
    const overlappingCages = new Array<Cage>();

    const cellsToCagesMap = new Map<CellKey, Set<Cage>>();
    cells.forEach(cell => {
        cellsToCagesMap.set(cell.key, new Set());
    });
    cages.forEach(cage => {
        cage.cells.forEach(cell => {
            (cellsToCagesMap.get(cell.key) as Set<Cage>).add(cage);
        });
    });

    const allCagesAreNonOverlapping = Array.from(cellsToCagesMap.values()).every(cageSet => cageSet.size === 1);
    if (allCagesAreNonOverlapping) {
        nonOverlappingCages.push(...cages);
        nonOverlappingCagesCellCount = nonOverlappingCages.reduce((partialSum, a) => partialSum + a.cellCount, 0);
    } else {
        const maxNonOverlappingCagesAreaModelSet = findMaxNonOverlappingCagesArea(cages, absMaxAreaCellCount);
        cages.forEach(cage => {
            if (maxNonOverlappingCagesAreaModelSet.has(cage)) {
                nonOverlappingCages.push(cage);
                nonOverlappingCagesCellCount = nonOverlappingCages.reduce((partialSum, a) => partialSum + a.cellCount, 0);
            } else {
                overlappingCages.push(cage);
            }
        });
    }

    return {
        nonOverlappingCages,
        nonOverlappingCagesCellCount,
        overlappingCages
    };
}

type Context = {
    allCagesSet: Set<Cage>;
    maxAreaSet: Set<Cage>;
    maxAreaCellCount: number;
    cellCount: number;
    cagesStack: Set<Cage>;
    remainingCagesStack: Set<Cage>;
    overlappingCagesStack: Set<Cage>;
    areaCellKeysStack: CellKeysSet;
    absMaxAreaCellCount: number;
}

// there is an issue with it having single cells ommitted sometimes + we can add cages with non-overlapping cells ahead of time to reduce computational overhead
function findMaxNonOverlappingCagesArea(cages: ReadonlyCages, absMaxAreaCellCount: number) {
    const context: Context = {
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

function findBiggestNonOverlappingCagesAreaRecursive(cage: Cage, context: Context) {
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
        context.maxAreaSet = new Set<Cage>(context.cagesStack);
        context.maxAreaCellCount = context.cellCount;
    }

    const nextCage = context.remainingCagesStack.values().next().value;
    findBiggestNonOverlappingCagesAreaRecursive(nextCage, context);

    context.cellCount -= cage.cellCount;
    cage.cells.forEach(cell => context.areaCellKeysStack.delete(cell.key));
    context.remainingCagesStack.add(cage);
    context.cagesStack.delete(cage);
}

function doFindForNonOverlappingCages(cages: ReadonlyCages, nonOverlappingCagesCells: number) {
    const totalSum = cages.reduce((partialSum, a) => partialSum + a.sum, 0);
    if (totalSum > House.SUM) {
        throw `Total cage with non-overlapping cells should be <= ${House.SUM}. Actual: ${totalSum}. Cages: {${joinArray(cages)}}`;
    }
    if (cages.length == 0) {
        return [];
    }

    const combosForCages = cages.map(cage => combosForSum(cage.sum, cage.cellCount));
    if (combosForCages.length === 1) {
        return combosForCages[0].val.map(combo => [ combo ]);
    }

    const combos = new Array<ReadonlyCombos>();
    const stack = new Array(cages.length);
    const numFlags = new FastNumSet();

    function combosRecursive_0(sumCombos: SumCombos, step: number) {
        for (const comboForSum of sumCombos.val) {
            stack[step] = comboForSum;

            numFlags.add(comboForSum.fastNumSet);
            combosRecursive(step + 1);
            numFlags.remove(comboForSum.fastNumSet);
        }
    }

    function combosRecursive_i(sumCombos: SumCombos, step: number) {
        for (const comboForSum of sumCombos.val) {
            if (numFlags.doesNotHaveAny(comboForSum.fastNumSet)) {
                stack[step] = comboForSum;

                numFlags.add(comboForSum.fastNumSet);
                combosRecursive(step + 1);
                numFlags.remove(comboForSum.fastNumSet);
            }
        }
    }

    function combosRecursive_last() {
        combos.push([...stack]);
    }

    function combosRecursive_preLast_shortCircuit(sumCombos: SumCombos, step: number) {
        const lastCombo = sumCombos.get(numFlags.remaining());
        if (lastCombo !== undefined) {
            stack[step] = lastCombo;
            combosRecursive_last();
        }
    }

    const executionPipeline = new Array<(sumCombos: SumCombos, step: number) => void>(cages.length + 1);
    executionPipeline[0] = combosRecursive_0;
    if (nonOverlappingCagesCells === House.CELL_COUNT) {
        _.range(1, cages.length - 1).forEach(step => {
            executionPipeline[step] = combosRecursive_i;
        });
        executionPipeline[cages.length - 1] = combosRecursive_preLast_shortCircuit;
    } else {
        _.range(1, cages.length).forEach(step => {
            executionPipeline[step] = combosRecursive_i;
        });
        executionPipeline[cages.length] = combosRecursive_last;
    }

    function combosRecursive(step: number) {
        executionPipeline[step](combosForCages[step], step);
    }

    combosRecursive(0);

    return combos;
}

function doFindForOverlappingCages(cages: ReadonlyCages) {
    if (cages.length === 0) return [];

    const combos = new Array<ReadonlyCombos>();
    const combosForCages = cages.map(cage => combosForSum(cage.sum, cage.cellCount));
    const stack = new Array(cages.length);

    function combosRecursive(step: number) {
        if (step === cages.length) {
            combos.push([...stack]);
        } else {
            const combosForSum = combosForCages[step];
            for (const comboForSum of combosForSum.val) {
                stack[step] = comboForSum;
                combosRecursive(step + 1);
            }
        }
    }

    combosRecursive(0);

    return combos;
}

function merge(combosForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>, combosForOverlappingCages: ReadonlyArray<ReadonlyCombos>) {
    if (combosForOverlappingCages.length === 0) {
        return combosForNonOverlappingCages;
    }
    else {
        const merged = new Array<ReadonlyCombos>();
        combosForNonOverlappingCages.forEach(combosLeft => {
            combosForOverlappingCages.forEach(combosRight => {
                merged.push(combosLeft.concat(combosRight));
            });
        });
        return merged;
    }
}

function preserveOrder(combinedCombos: ReadonlyArray<ReadonlyCombos>, cages: ReadonlyCages, nonOverlappingCages: ReadonlyCages, overlappingCages: ReadonlyCages): ReadonlyArray<ReadonlyCombos> {
    if (overlappingCages.length === 0) {
        return combinedCombos;
    }
    else {
        const orderPreservedCombos = new Array<Array<Combo>>();

        const cageIndexResolvers = new Array(cages.length);
        nonOverlappingCages.forEach((cage, index) => {
            cageIndexResolvers[index] = cages.findIndex(originalCage => originalCage === cage);
        });
        overlappingCages.forEach((cage, index) => {
            cageIndexResolvers[nonOverlappingCages.length + index] = cages.findIndex(originalCage => originalCage === cage);
        });
        combinedCombos.forEach(comboSets => {
            const preservedOrderCombo = new Array(comboSets.length);
            comboSets.forEach((numbersSet, index) => {
                preservedOrderCombo[cageIndexResolvers[index]] = numbersSet;
            });
            orderPreservedCombos.push(preservedOrderCombo);
        });

        return orderPreservedCombos;
    }
}
