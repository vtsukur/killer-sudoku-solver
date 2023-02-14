import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { ReadonlyCells } from '../../puzzle/cell';
import { House } from '../../puzzle/house';

export class NHouseCagesSegmentor {
    static segmentByCellsOverlap(cages: ReadonlyCages, cells: ReadonlyCells, n = 1) {
        if (!cages.length) {
            return { nonOverlappingCages: [], overlappingCages: [] };
        }

        return work(cages, cells, n);
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

const work = (cages: ReadonlyCages, cells: ReadonlyCells, n: number) => {
    const absMaxAreaCellCount = n * House.CELL_COUNT;
    const inputCages = new Array<Cage>(cages.length);
    const derivedCages = new Array<Cage>(cages.length);
    const usedCellsKeys = new Set<string>();
    let usedCellCount = 0;
    let i = 0, j = 0;
    for (const cage of cages) {
        if (cage.isInput) {
            inputCages[i++] = cage;
            for (const cell of cage.cells) {
                usedCellsKeys.add(cell.key);
            }
            usedCellCount += cage.cells.length;
        } else {
            derivedCages[j++] = cage;
        }
    }
    inputCages.length = i;
    derivedCages.length = j;

    if (usedCellCount === absMaxAreaCellCount) {
        return { nonOverlappingCages: inputCages, overlappingCages: derivedCages };
    } else {
        const ctx: Context = {
            allCages: derivedCages,
            absMaxAreaCellCount: absMaxAreaCellCount,
            cageCount: derivedCages.length,
            usedCages: new Set(inputCages),
            usedCellsKeys: usedCellsKeys,
            usedCellCount: usedCellCount,
            maxAreaCages: new Set(inputCages),
            maxAreaCellCount: usedCellCount,
            found: false
        };
        recursiveWork(0, ctx);

        const nonOverlappingCages = Array.from(ctx.maxAreaCages);
        const overlappingCages = cages.filter(cage => !ctx.maxAreaCages.has(cage));

        return { nonOverlappingCages, overlappingCages };
    }
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
