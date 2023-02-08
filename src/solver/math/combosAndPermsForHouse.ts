import * as _ from 'lodash';
import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { CellKey, CellKeysSet, ReadonlyCells } from '../../puzzle/cell';
import { House } from '../../puzzle/house';
import { HouseModel } from '../models/elements/houseModel';
import { Combo, ReadonlyCombos } from './combo';
import { NonOverlappingHouseCagesCombinatorics } from './nonOverlappingHouseCagesCombinatorics';
import { combosForSum } from './combosForSum';

export class HouseSumCombosAndPerms {
    readonly nonOverlappingCages: ReadonlyArray<Cage>;
    readonly sumPermsForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>;
    readonly actualSumCombos: ReadonlyArray<ReadonlyCombos>;

    constructor(nonOverlappingCages: ReadonlyArray<Cage>,
            sumPermsForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>,
            actualSumCombos: ReadonlyArray<ReadonlyCombos>) {
        this.nonOverlappingCages = nonOverlappingCages;
        this.sumPermsForNonOverlappingCages = sumPermsForNonOverlappingCages;
        this.actualSumCombos = actualSumCombos;
    }
}

export function combosAndPermsForHouse(houseM: HouseModel): HouseSumCombosAndPerms {
    const cages = houseM.cageModels.map(cageM => cageM.cage);
    const cells = houseM.cells;

    const { nonOverlappingCages, overlappingCages } = clusterCagesByOverlap(cages, cells);

    const { perms: perms, combos: combosForNonOverlappingCages } = NonOverlappingHouseCagesCombinatorics.computePermsAndCombos(nonOverlappingCages);
    const combosForOverlappingCages = doFindForOverlappingCages(overlappingCages);
    const actualSumCombos = preserveCombosOrder(combosForNonOverlappingCages, combosForOverlappingCages, cages, nonOverlappingCages, overlappingCages);

    return new HouseSumCombosAndPerms(nonOverlappingCages, perms, actualSumCombos);
}

export function clusterCagesByOverlap(cages: ReadonlyCages, cells: ReadonlyCells, absMaxAreaCellCount = House.CELL_COUNT) {
    if (!cages.length) {
        return { nonOverlappingCages: [], overlappingCages: [] };
    }

    const nonOverlappingCages = new Array<Cage>();
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

function doFindForOverlappingCages(cages: ReadonlyCages): ReadonlyArray<ReadonlyCombos> {
    return cages.map(cage => combosForSum(cage.sum, cage.cellCount).val);
}

function preserveCombosOrder(combosForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>, combosForOverlappingCages: ReadonlyArray<ReadonlyCombos>, cages: ReadonlyCages, nonOverlappingCages: ReadonlyCages, overlappingCages: ReadonlyCages): ReadonlyArray<ReadonlyCombos> {
    const orderPreservedCombos = new Array<ReadonlyArray<Combo>>(cages.length);

    _.range(cages.length).forEach(i => {
        const cage = cages[i];
        const nonOverlappingCageIndex = nonOverlappingCages.findIndex(originalCage => originalCage === cage);
        if (nonOverlappingCageIndex !== -1) {
            orderPreservedCombos[i] = combosForNonOverlappingCages[nonOverlappingCageIndex];
        } else {
            const overlappingCageIndex = overlappingCages.findIndex(originalCage => originalCage === cage);
            orderPreservedCombos[i] = combosForOverlappingCages[overlappingCageIndex];
        }
    });

    return orderPreservedCombos;
}
