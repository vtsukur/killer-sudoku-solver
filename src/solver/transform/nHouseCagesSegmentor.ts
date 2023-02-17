import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { House } from '../../puzzle/house';
import { CellIndicesCheckingSet } from '../math';

export class NHouseCagesSegmentor {
    static segmentByCellsOverlap(cages: ReadonlyCages, n = 1) {
        if (!cages.length) {
            return { nonOverlappingCages: [], overlappingCages: [] };
        }

        return work(cages, n);
    }
}

type Context = {
    allCages: ReadonlyCages,
    absMaxAreaCellCount: number,
    cageCount: number,
    usedCages: Set<Cage>,
    usedCellIndices: CellIndicesCheckingSet,
    usedCellCount: number,
    maxAreaCages: Set<Cage>,
    maxAreaCellCount: number,
    found: boolean
};

const work = (cages: ReadonlyCages, n: number) => {
    const absMaxAreaCellCount = n * House.CELL_COUNT;
    const inputCages = new Array<Cage>(cages.length);
    const derivedCages = new Array<Cage>(cages.length);
    let usedCellCount = 0;
    let i = 0, j = 0;
    for (const cage of cages) {
        if (cage.isInput) {
            inputCages[i++] = cage;
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
        const usedCellIndices = new CellIndicesCheckingSet();
        for (const inputCage of inputCages) {
            usedCellIndices.add(inputCage.cellIndicesCheckingSet);
        }
        const ctx: Context = {
            allCages: derivedCages,
            absMaxAreaCellCount: absMaxAreaCellCount,
            cageCount: derivedCages.length,
            usedCages: new Set(inputCages),
            usedCellIndices,
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

    if (!ctx.usedCellIndices.doesNotHaveAny(cage.cellIndicesCheckingSet)) return;

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
