import * as _ from 'lodash';
import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { CellKey, CellKeysSet, ReadonlyCells } from '../../puzzle/cell';
import { House } from '../../puzzle/house';
import { joinArray } from '../../util/readableMessages';
import { HouseModel } from '../models/elements/houseModel';
import { Combo, ReadonlyCombos } from './combo';
import { combosForSum, SumCombos } from './combosForSum';
import { BinaryStorage, FastNumSet } from './fastNumSet';

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

    const { nonOverlappingCages, nonOverlappingCagesCellCount, overlappingCages } = clusterCagesByOverlap(cages, cells);

    const { permsForNonOverlappingCages, actualSumCombos: combosForNonOverlappingCages } = doFindForNonOverlappingCages(nonOverlappingCages, nonOverlappingCagesCellCount);
    const combosForOverlappingCages = doFindForOverlappingCages(overlappingCages);
    const actualSumCombos = preserveCombosOrder(combosForNonOverlappingCages, combosForOverlappingCages, cages, nonOverlappingCages, overlappingCages);

    return new HouseSumCombosAndPerms(nonOverlappingCages, permsForNonOverlappingCages, actualSumCombos);
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

type NonOverlappingCageSumCombos = {
    permsForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>,
    actualSumCombos: ReadonlyArray<ReadonlyCombos>
};

function doFindForNonOverlappingCages(cages: ReadonlyCages, nonOverlappingCagesCells: number): NonOverlappingCageSumCombos {
    const totalSum = cages.reduce((partialSum, a) => partialSum + a.sum, 0);
    if (totalSum > House.SUM) {
        throw `Total cage with non-overlapping cells should be <= ${House.SUM}. Actual: ${totalSum}. Cages: {${joinArray(cages)}}`;
    }
    if (cages.length == 0) {
        return { permsForNonOverlappingCages: [], actualSumCombos: [] };
    }

    const combosForCages = cages.map(cage => combosForSum(cage.sum, cage.cellCount));
    if (combosForCages.length === 1) {
        return {
            permsForNonOverlappingCages: combosForCages[0].val.map(combo => [ combo ]),
            actualSumCombos: [ combosForCages[0].val ]
        };
    }

    const perms = new Array<ReadonlyCombos>();
    const stack = new Array<Combo>(cages.length);
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

    const actualSumCombos = new Array<Array<Combo>>(cages.length);
    const actualSumCombosHash = new Array<Set<BinaryStorage>>();
    _.range(cages.length).forEach(i => {
        actualSumCombos[i] = [];
        actualSumCombosHash[i] = new Set<BinaryStorage>();
    });

    function combosRecursive_last() {
        perms.push([...stack]);
        _.range(cages.length).forEach(i => {
            actualSumCombosHash[i].add(stack[i].fastNumSet.binaryStorage);
        });
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

    _.range(cages.length).forEach(i => {
        const sumCombos = combosForCages[i];
        const actualSumCombosSet = actualSumCombosHash[i];

        for (const combo of sumCombos.val) {
            if (actualSumCombosSet.has(combo.fastNumSet.binaryStorage)) {
                actualSumCombos[i].push(combo);
            }
        }
    });

    return { permsForNonOverlappingCages: perms, actualSumCombos };
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
