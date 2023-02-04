import * as _ from 'lodash';
import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { CellKey, CellKeysSet, ReadonlyCells } from '../../puzzle/cell';
import { House } from '../../puzzle/house';
import { Numbers } from '../../puzzle/numbers';
import { joinArray } from '../../util/readableMessages';
import { Sets } from '../../util/sets';
import { HouseModel } from '../models/elements/houseModel';
import { Combo, ComboKey, ReadonlyCombos } from './combo';
import { combosForSum } from './combosForSum';

export function combosForHouse(houseM: HouseModel): ReadonlyArray<ReadonlyCombos> {
    const cages = houseM.cageModels.map(cageM => cageM.cage);
    const cells = houseM.cells;

    const { nonOverlappingCages, overlappingCages } = clusterCagesByOverlap(cages, cells);

    const combosForNonOverlappingCages = doFindForNonOverlappingCagesFast(nonOverlappingCages);
    const combosForOverlappingCages = doFindForOverlappingCages(overlappingCages);
    const combinedCombos = merge(combosForNonOverlappingCages, combosForOverlappingCages);
    const preservedCageOrderCombos = preserveOrder(combinedCombos, cages, nonOverlappingCages, overlappingCages);

    return preservedCageOrderCombos;
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

class ComboIterator implements Iterator<Combo> {
    private i = 0;

    private readonly combos: ReadonlyCombos;
    private readonly usedCombos: ReadonlyMap<ComboKey, boolean>;

    constructor(combos: ReadonlyCombos, usedCombos: ReadonlyMap<ComboKey, boolean>) {
        this.combos = combos;
        this.usedCombos = usedCombos;
    }

    [Symbol.iterator](): Iterator<Combo> {
        return this;
    }

    next(): IteratorResult<Combo> {
        while (this.i < this.combos.length && this.usedCombos.get(this.combos[this.i].key)) {
            ++this.i;
        }

        if (this.i < this.combos.length) {
            return {
                value: this.combos[this.i++],
                done: false
            };
        } else {
            return {
                value: undefined,
                done: true
            };
        }
    }
};

class HouseCombo {
    private readonly combos: ReadonlyCombos;
    private readonly map: Map<number, Array<Combo>> = new Map();
    private readonly usedCombos: Map<ComboKey, boolean> = new Map();
    private readonly stack = new Array<Array<Combo>>();

    constructor(combos: ReadonlyCombos) {
        this.combos = combos;
        _.range(1, Numbers.MAX + 1).forEach(i => {
            this.map.set(i, []);
        });
        for (const combo of combos) {
            this.usedCombos.set(combo.key, false);
            for (const num of combo) {
                this.map.get(num)?.push(combo);
            }
        }
    }

    markAsUsed(comboInUse: Combo) {
        const _st = new Array<Combo>();
        for (const num of comboInUse) {
            for (const combo of this.map.get(num) as Array<Combo>) {
                if (!this.usedCombos.get(combo.key)) {
                    this.usedCombos.set(combo.key, true);
                    _st.push(combo);
                }
            }
        }
        this.stack.push(_st);
    }

    markAsUnusedPop() {
        for (const combo of this.stack.pop() as Combo[]) {
            this.usedCombos.set(combo.key, false);
        }
    }

    unusedCombosIterator(): ComboIterator {
        return new ComboIterator(this.combos, this.usedCombos);
    }
}

function doFindForNonOverlappingCagesFast(cages: ReadonlyCages) {
    const totalSum = cages.reduce((partialSum, a) => partialSum + a.sum, 0);
    if (totalSum > House.SUM) {
        throw `Total cage with non-overlapping cells should be <= ${House.SUM}. Actual: ${totalSum}. Cages: {${joinArray(cages)}}`;
    }
    if (cages.length == 0) {
        return [];
    }

    const combos = new Array<ReadonlyCombos>();
    const houseCombos = cages.map(cage => new HouseCombo(combosForSum(cage.sum, cage.cellCount)));
    const stack = new Array(cages.length);
    // const checkingSet = new Set<number>();

    function combosRecursive(step: number) {
        if (step === cages.length) {
            combos.push([...stack]);
        } else {
            const houseCombo = houseCombos[step];
            for (const combo of houseCombo.unusedCombosIterator()) {
                let i = step + 1;
                while (i < cages.length) {
                    houseCombos[i].markAsUsed(combo);
                    ++i;
                }

                stack[step] = combo;

                combosRecursive(step + 1);

                i = cages.length - 1;
                while (i > step) {
                    houseCombos[i].markAsUnusedPop();
                    --i;
                }
            }
        }
    }

    combosRecursive(0);

    return combos;
}
function doFindForNonOverlappingCages(cages: ReadonlyCages) {
    const totalSum = cages.reduce((partialSum, a) => partialSum + a.sum, 0);
    if (totalSum > House.SUM) {
        throw `Total cage with non-overlapping cells should be <= ${House.SUM}. Actual: ${totalSum}. Cages: {${joinArray(cages)}}`;
    }
    if (cages.length == 0) {
        return [];
    }

    const combos = new Array<ReadonlyCombos>();
    const combosForCages = cages.map(cage => combosForSum(cage.sum, cage.cellCount));
    const stack = new Array(cages.length);
    const checkingSet = new Set<number>();

    function combosRecursive(step: number) {
        if (step === cages.length) {
            combos.push([...stack]);
        } else {
            const combosForSum = combosForCages[step];
            for (const comboForSum of combosForSum) {
                if (!comboForSum.hasSome(checkingSet)) {
                    stack[step] = comboForSum;

                    Sets.U(checkingSet, comboForSum);
                    combosRecursive(step + 1);
                    Sets._(checkingSet, comboForSum);
                }
            }
        }
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
            for (const comboForSum of combosForSum) {
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
