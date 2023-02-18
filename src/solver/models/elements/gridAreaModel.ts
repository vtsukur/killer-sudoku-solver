import { Cage, ReadonlyCages } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CellIndicesCheckingSet, ReadonlyCellIndicesCheckingSet } from '../../math';

/**
 * Container for the grouping of {@link Cage}s within the {@link Grid} area holding two collections:
 *
 *  - {@link Cage}s which do NOT _overlap_ with each other forming region of maximum possible area;
 *  - {@link Cage}s which overlap with the area formed by _non-overlapping_ {@link Cage}s.
 */
type NonOverlappingCagesAreaModel = {
    readonly cages: ReadonlyCages;
    readonly cellCount: number;
    readonly cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet;
}

export class GridAreaModel {
    readonly nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel;
    readonly overlappingCages: ReadonlyCages;
    // sum = 0;

    constructor(nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel, overlappingCages: ReadonlyCages) {
        this.nonOverlappingCagesAreaModel = nonOverlappingCagesAreaModel;
        this.overlappingCages = overlappingCages;
        // this.nonOverlappingCages.forEach(cage => {
        //     this.sum += cage.sum;
        //     cage.cells.forEach(cell => this.nonOverlappingCellsSet.add(cell));
        // });
    }

    computeSum() {
        return this.nonOverlappingCagesAreaModel.cages.reduce((prev, current) => prev + current.sum, 0);
    }

    hasNonOverlapping(cell: Cell) {
        return this.nonOverlappingCagesAreaModel.cellIndicesCheckingSet.hasAll(CellIndicesCheckingSet.of(cell.index));
    }

    /**
     * Finds maximum area of _non-overlapping_ {@link Cage}s for the given {@link Cage}s.
     *
     * {@link Cage}s are considered _non-overlapping_ if they do NOT have {@link Cell}s
     * which are also present in other {@link Cage}s of the same {@link GridAreaModel}.
     *
     * For performance reasons {@link Cage}s which have `{@link Cage.input} === true`
     * are always marked as non-overlapping collection even it will result in finding smaller area.
     *
     * @param cages - {@link Cage}s within the {@link GridAreaModel} to find maximum area for.
     * @param houseCount - number of {@link House}s that the {@link GridAreaModel} covers.
     * Used to calculate possible upper bound of maximum area which is `{@link House.CELL_COUNT} * houseCount`.
     *
     * @returns Container holding two collections:
     *  - {@link Cage}s which do NOT _overlap_ with each other forming maximum possible area;
     *  - {@link Cage}s which overlap with the area formed by _non-overlapping_ {@link Cage}s.
     */
    static from(cages: ReadonlyCages, houseCount = 1): GridAreaModel {
        if (!cages.length) {
            return new GridAreaModel({
                cages: [],
                cellCount: 0,
                cellIndicesCheckingSet: CellIndicesCheckingSet.of()
            }, []);
        }

        return work(cages, houseCount);
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
    maxAreaCellIndices: CellIndicesCheckingSet,
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

    const usedCellIndices = new CellIndicesCheckingSet();
    for (const inputCage of inputCages) {
        usedCellIndices.add(inputCage.cellIndicesCheckingSet);
    }

    if (usedCellCount === absMaxAreaCellCount) {
        return new GridAreaModel({
            cages: inputCages,
            cellCount: usedCellCount,
            cellIndicesCheckingSet: usedCellIndices
        }, derivedCages);
    } else {

        // additionally pre-filter cages which overlap

        const ctx: Context = {
            allCages: derivedCages,
            absMaxAreaCellCount: absMaxAreaCellCount,
            cageCount: derivedCages.length,
            usedCages: new Set(inputCages),
            usedCellIndices,
            usedCellCount: usedCellCount,
            maxAreaCages: new Set(inputCages),
            maxAreaCellCount: usedCellCount,
            maxAreaCellIndices: usedCellIndices,
            found: false
        };
        recursiveWork(0, ctx);

        const cagesOfMaxNonOverlappingRegion = Array.from(ctx.maxAreaCages);
        const cagesOfOverlappingRegion = cages.filter(cage => !ctx.maxAreaCages.has(cage));

        return new GridAreaModel({
            cages: cagesOfMaxNonOverlappingRegion,
            cellCount: ctx.maxAreaCellCount,
            cellIndicesCheckingSet: ctx.maxAreaCellIndices
        }, cagesOfOverlappingRegion);
    }
};

const recursiveWork = (step: number, ctx: Context) => {
    if (ctx.usedCellCount > ctx.absMaxAreaCellCount) {
        return;
    } else if (ctx.usedCellCount > ctx.maxAreaCellCount) {
        ctx.maxAreaCellCount = ctx.usedCellCount;
        ctx.maxAreaCages = new Set(Array.from(ctx.usedCages));
        ctx.maxAreaCellIndices = ctx.usedCellIndices.clone();

        if (ctx.usedCellCount === ctx.absMaxAreaCellCount) {
            ctx.found = true;
            return;
        }
    }

    if (step === ctx.cageCount) {
        return;
    }

    const cage = ctx.allCages[step];

    if (ctx.usedCellIndices.doesNotHaveAny(cage.cellIndicesCheckingSet)) {
        // with cage / recursively
        ctx.usedCellIndices.add(cage.cellIndicesCheckingSet);
        ctx.usedCages.add(cage);
        ctx.usedCellCount += cage.cellCount;
        recursiveWork(step + 1, ctx);
        if (ctx.found) return;

        // without cage / recursively
        ctx.usedCellIndices.remove(cage.cellIndicesCheckingSet);
        ctx.usedCages.delete(cage);
        ctx.usedCellCount -= cage.cellCount;
    }

    recursiveWork(step + 1, ctx);
    if (ctx.found) return;
};
