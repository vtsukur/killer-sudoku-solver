import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { CellKey, CellKeysSet, ReadonlyCells } from '../../puzzle/cell';
import { House } from '../../puzzle/house';

export class HouseCagesSegmentor {
    static segmentByCellsOverlap(cages: ReadonlyCages, cells: ReadonlyCells, absMaxAreaCellCount = House.CELL_COUNT) {
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
