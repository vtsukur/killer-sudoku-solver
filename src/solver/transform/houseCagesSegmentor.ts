import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { ReadonlyCells } from '../../puzzle/cell';
import { House } from '../../puzzle/house';

export class HouseCagesSegmentor {
    static segmentByCellsOverlap(cages: ReadonlyCages, cells: ReadonlyCells, absMaxAreaCellCount = House.CELL_COUNT) {
        if (!cages.length) {
            return { nonOverlappingCages: [], overlappingCages: [] };
        }

        return work(cages, cells, absMaxAreaCellCount);
    }
}

type Context = {
    allCages: ReadonlyCages,
    absMaxAreaCellCount: number,
    cageCount: number,
    usedCages: Set<Cage>,
    usedCellsKeys: Set<string>,
    usedCellCount: number,
    maxAreaCages: Set<Cage>,
    maxAreaCellCount: number,
    found: boolean
};

const work = (cages: ReadonlyCages, cells: ReadonlyCells, absMaxAreaCellCount = House.CELL_COUNT) => {
    const ctx: Context = {
        allCages: cages,
        absMaxAreaCellCount: absMaxAreaCellCount,
        cageCount: cages.length,
        usedCages: new Set(),
        usedCellsKeys: new Set(),
        usedCellCount: 0,
        maxAreaCages: new Set(),
        maxAreaCellCount: 0,
        found: false
    };
    recursiveWork(0, ctx);

    const nonOverlappingCages = Array.from(ctx.maxAreaCages);
    const overlappingCages = cages.filter(cage => !ctx.maxAreaCages.has(cage));

    return { nonOverlappingCages, overlappingCages };
};

const recursiveWork = (step: number, ctx: Context) => {
    if (ctx.usedCellCount > ctx.absMaxAreaCellCount) {
        return;
    } else if (ctx.usedCellCount > ctx.maxAreaCellCount) {
        // check overlaps
        const usedCellsKeys = new Set<string>();
        for (const usedCage of ctx.usedCages) {
            for (const usedCell of usedCage.cells) {
                if (usedCellsKeys.has(usedCell.key)) {
                    return;
                } else {
                    usedCellsKeys.add(usedCell.key);
                }
            }
        }
        ctx.maxAreaCellCount = ctx.usedCellCount;
        ctx.maxAreaCages = new Set(Array.from(ctx.usedCages));

        if (ctx.usedCellCount === ctx.absMaxAreaCellCount) {
            ctx.found = true;
            return;
        }
    }

    if (step === ctx.cageCount) {
        return;
    }

    const cage = ctx.allCages[step];

    // with cage / recursively
    ctx.usedCages.add(cage);
    ctx.usedCellCount += cage.cellCount;
    recursiveWork(step + 1, ctx);
    if (ctx.found) return;

    // without cage / recursively
    ctx.usedCages.delete(cage);
    ctx.usedCellCount -= cage.cellCount;
    recursiveWork(step + 1, ctx);
    if (ctx.found) return;
};
