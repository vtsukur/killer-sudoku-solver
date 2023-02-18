import { Cage, ReadonlyCages } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from '../../../puzzle/grid';
import { House } from '../../../puzzle/house';
import { CellIndicesCheckingSet, ReadonlyCellIndicesCheckingSet } from '../../math';

/**
 * Area on the {@link Grid} defined by a group of {@link Cage}s.
 *
 * Upon construction of the area instance, {@link Cage}s are divided into two collections:
 *
 *  - {@link Cage}s which do NOT _overlap_ with each other forming maximum possible area.
 * Defined by {@link nonOverlappingCagesAreaModel}.
 *  - {@link Cage}s which overlap with the area formed by _non-overlapping_ {@link Cage}s.
 * Defined by {@link overlappingCages}.
 *
 * {@link Cage}s are considered _non-overlapping_ if they do NOT have {@link Cell}s
 * which are also present in other {@link Cage}s of the same {@link Grid}.
 *
 * @public
 */
export class GridAreaModel {

    /**
     * Area of _non-overlapping_ {@link Cage}s on the {@link Grid}.
     */
    readonly nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel;

    /**
     * {@link Cage}s which overlap with the area formed by {@link nonOverlappingCagesAreaModel}.
     */
    readonly overlappingCages: ReadonlyCages;

    constructor(nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel, overlappingCages: ReadonlyCages) {
        this.nonOverlappingCagesAreaModel = nonOverlappingCagesAreaModel;
        this.overlappingCages = overlappingCages;
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
            return new GridAreaModel(new PrecomputedNonOverlappingCagesAreaModelWithLazySum(
                [], 0, CellIndicesCheckingSet.of()
            ), []);
        }

        return work(cages, houseCount);
    }

}

/**
 * Area of _non-overlapping_ {@link Cage}s on the {@link Grid}.
 *
 * {@link Cage}s are considered _non-overlapping_ if they do NOT have {@link Cell}s
 * which are also present in other {@link Cage}s of the same {@link Grid}.
 *
 * @public
 */
export interface NonOverlappingCagesAreaModel {

    /**
     * _Non-overlapping_ {@link Cage}s on the {@link Grid} which are a part of this area.
     *
     * {@link Cage}s are considered _non-overlapping_ if they do NOT have {@link Cell}s
     * which are also present in other {@link Cage}s of the same {@link Grid}.
     */
    readonly cages: ReadonlyCages;

    /**
     * Amount of {@link Cell}s in all _non-overlapping_ {@link cages} of this area.
     */
    readonly cellCount: number;

    /**
     * Sum of all _non-overlapping_ {@link cages} in this area.
     */
    readonly sum: number;

    /**
     * Checks whether the given {@link Cell} is a part of _non-overlapping_ {@link cages} of this area.
     *
     * @param cell - {@link Cell} to check for being a part of _non-overlapping_ {@link cages} of this area.
     *
     * @returns `true` if the given {@link Cell} is a part of _non-overlapping_ {@link cages} of this area;
     * otherwise `false`.
     */
    has(cell: Cell): boolean;

}

class PrecomputedNonOverlappingCagesAreaModelWithLazySum implements NonOverlappingCagesAreaModel {

    readonly cages: ReadonlyCages;
    readonly cellCount: number;

    private readonly _cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet;
    private _sum = 0;

    constructor(cages: ReadonlyCages, cellCount: number, cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet) {
        this.cages = cages;
        this.cellCount = cellCount;
        this._cellIndicesCheckingSet = cellIndicesCheckingSet;
    }

    get sum() {
        // Lazy initialization is used instead of precomputation
        // since many usages of the area model does NOT need sum at all.
        return this._sum === 0 ? this._sum = this.cages.reduce((prev, current) => prev + current.sum, 0) : this._sum;
    }

    has(cell: Cell) {
        // Use of `ReadonlyCellIndicesCheckingSet` enables extremely fast performance of the check.
        return this._cellIndicesCheckingSet.hasAll(CellIndicesCheckingSet.of(cell.index));
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
        return new GridAreaModel(new PrecomputedNonOverlappingCagesAreaModelWithLazySum(
            inputCages, usedCellCount, usedCellIndices
        ), derivedCages);
    } else {
        const nonOverlappingDerivedCages = derivedCages.filter(cage => usedCellIndices.doesNotHaveAny(cage.cellIndicesCheckingSet));
        const ctx: Context = {
            allCages: nonOverlappingDerivedCages,
            absMaxAreaCellCount: absMaxAreaCellCount,
            cageCount: nonOverlappingDerivedCages.length,
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

        return new GridAreaModel(new PrecomputedNonOverlappingCagesAreaModelWithLazySum(
            cagesOfMaxNonOverlappingRegion, ctx.maxAreaCellCount, ctx.maxAreaCellIndices
        ), cagesOfOverlappingRegion);
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
