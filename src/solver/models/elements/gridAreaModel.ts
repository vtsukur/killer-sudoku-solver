import { Cage, ReadonlyCages } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from '../../../puzzle/grid';
import { House } from '../../../puzzle/house';
import { ReadonlyCellIndicesCheckingSet } from '../../math';
import { CellIndicesCheckingSet } from '../../math/cellIndicesCheckingSet';

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
     * Checking set of {@link Cell} indices which has
     * {@link Cell}s of all _non-overlapping_ {@link cages} of this area marked as included.
     */
    readonly cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet;

    /**
     * Sum of all _non-overlapping_ {@link cages} in this area.
     */
    readonly sum: number;

}

class PrecomputedNonOverlappingCagesAreaModelWithLazySum implements NonOverlappingCagesAreaModel {

    private _sum = 0;

    constructor(
            readonly cages: ReadonlyCages,
            readonly cellCount: number,
            readonly cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet) {
    }

    get sum() {
        // Lazy initialization is used instead of precomputation
        // since many usages of the area model does NOT need sum at all.
        return this._sum === 0 ? this._sum = this.cages.reduce((prev, current) => prev + current.sum, 0) : this._sum;
    }

}

/**
 * Area on the {@link Grid} defined by a group of {@link Cage}s.
 *
 * Upon construction of the area instance, {@link Cage}s are divided into two collections:
 *
 *  - {@link Cage}s which do NOT _overlap_ with each other forming maximum possible area.
 * Defined by {@link nonOverlappingCagesAreaModel}.
 *  - {@link Cage}s which overlap with the area formed by {@link nonOverlappingCagesAreaModel}.
 * Defined by {@link overlappingCages}.
 *
 * {@link Cage}s are considered _non-overlapping_ if they do NOT have {@link Cell}s
 * which are also present in other {@link Cage}s of the same {@link Grid}.
 *
 * @public
 */
export interface GridAreaModel {

    /**
     * Area of _non-overlapping_ {@link Cage}s on the {@link Grid}.
     */
    readonly nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel;

    /**
     * {@link Cage}s which overlap with the area formed by {@link nonOverlappingCagesAreaModel}.
     */
    readonly overlappingCages: ReadonlyCages;

}

/**
 * Area on the {@link Grid} defined by a group of {@link Cage}s
 * with static factory method {@link from}.
 *
 * @public
 */
export class GridAreaModel implements GridAreaModel {

    private constructor(
        readonly nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel,
        readonly overlappingCages: ReadonlyCages) {}

    private static readonly _EMPTY = new GridAreaModel(
        new PrecomputedNonOverlappingCagesAreaModelWithLazySum(
            [], 0, CellIndicesCheckingSet.newEmpty()
        ), []
    );

    /**
     * Constructs new area on the {@link Grid} defined by a group of the given {@link Cage}s.
     *
     * {@link Cage}s are divided into two collections:
     *
     *  - {@link Cage}s which do NOT _overlap_ with each other forming maximum possible area.
     * Defined by {@link nonOverlappingCagesAreaModel}.
     *  - {@link Cage}s which overlap with the area formed by {@link nonOverlappingCagesAreaModel}.
     * Defined by {@link overlappingCages}.
     *
     * {@link Cage}s are considered _non-overlapping_ if they do NOT have {@link Cell}s
     * which are also present in other {@link Cage}s of the same {@link Grid}.
     *
     * For performance reasons {@link Cage}s which have `Cage.input === true`
     * are always added to the {@link nonOverlappingCagesAreaModel} even it will result in finding
     * an area of a smaller size.
     *
     * @param cages - {@link Cage}s to construct this {@link GridAreaModel} from.
     * @param houseCount - number of {@link House}s that the {@link GridAreaModel} covers.
     * Used to calculate possible upper bound of maximum area which is `House.CELL_COUNT * houseCount`.
     *
     * @returns new area on the {@link Grid} defined by a group of the given {@link Cage}s.
     */
    static from(cages: ReadonlyCages, houseCount = 1): GridAreaModel {
        return cages.length !== 0 ? newGridAreaModelWithMaxNonOverlappingArea(cages, houseCount) : this._EMPTY;
    }

}

const newGridAreaModelWithMaxNonOverlappingArea = (allCages: ReadonlyCages, houseCount: number): GridAreaModel => {
    const absMaxAreaCellCount = houseCount * House.CELL_COUNT;

    const inputAndDerivedCagesArea = stage1_splitCagesIntoInputAndDerivedCagesArea(allCages);
    if (inputAndDerivedCagesArea.nonOverlappingCagesAreaModel.cellCount === absMaxAreaCellCount) {
        // If input `Cage`s cover the whole area then the maximum non-overlapping area has been already found
        // and it consists of these input `Cage`s.
        return inputAndDerivedCagesArea;
    } else {
        return stage2_preFilterAndMaximizeNonOverlappingArea(allCages, absMaxAreaCellCount, inputAndDerivedCagesArea);
    }
};

const stage1_splitCagesIntoInputAndDerivedCagesArea = (allCages: ReadonlyCages): GridAreaModel => {
    const inputCages = new Array<Cage>();
    let inputCagesCellCount = 0;

    const derivedCages = new Array<Cage>();

    const inputCagesCellIndices = CellIndicesCheckingSet.newEmpty();
    for (const cage of allCages) {
        if (cage.isInput) {
            inputCages.push(cage);
            inputCagesCellIndices.add(cage.cellIndicesCheckingSet);
            inputCagesCellCount += cage.cells.length;
        } else {
            derivedCages.push(cage);
        }
    }

    return {
        nonOverlappingCagesAreaModel: new PrecomputedNonOverlappingCagesAreaModelWithLazySum(
            inputCages, inputCagesCellCount, inputCagesCellIndices
        ),
        overlappingCages: derivedCages
    };
};

class Context {

    readonly cageCount: number;
    readonly usedCages: Set<Cage>;
    usedCellCount: number;
    readonly usedCellIndices: CellIndicesCheckingSet;
    maxAreaCages: Set<Cage>;
    maxAreaCellCount: number;
    maxAreaCellIndices: ReadonlyCellIndicesCheckingSet;
    found: boolean;

    constructor(readonly cages: ReadonlyCages,
            readonly absMaxAreaCellCount: number,
            nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel) {
        this.cageCount = cages.length;
        this.usedCages = new Set(nonOverlappingCagesAreaModel.cages);
        this.usedCellCount = nonOverlappingCagesAreaModel.cellCount;
        this.usedCellIndices = new CellIndicesCheckingSet(nonOverlappingCagesAreaModel.cellIndicesCheckingSet);
        this.maxAreaCages = new Set(nonOverlappingCagesAreaModel.cages);
        this.maxAreaCellCount = nonOverlappingCagesAreaModel.cellCount;
        this.maxAreaCellIndices = nonOverlappingCagesAreaModel.cellIndicesCheckingSet;
        this.found = false;
    }

    buildMaxNonOverlappingCagesAreaModel() {
        return new PrecomputedNonOverlappingCagesAreaModelWithLazySum(
            Array.from(this.maxAreaCages), this.maxAreaCellCount, this.maxAreaCellIndices
        );
    }

    buildOverlappingCages(allCages: ReadonlyCages) {
        return allCages.filter(cage => !this.maxAreaCages.has(cage));
    }

    saveNewMaxNonOverlappingArea() {
        this.maxAreaCellCount = this.usedCellCount;
        this.maxAreaCages = new Set(Array.from(this.usedCages));
        this.maxAreaCellIndices = this.usedCellIndices.clone();
        if (this.usedCellCount === this.absMaxAreaCellCount) {
            this.found = true;
        }

        return this.found;
    }

};

const stage2_preFilterAndMaximizeNonOverlappingArea = (allCages: ReadonlyCages, absMaxAreaCellCount: number, inputAndDerivedCagesArea: GridAreaModel): GridAreaModel => {
    const usedCellIndices = inputAndDerivedCagesArea.nonOverlappingCagesAreaModel.cellIndicesCheckingSet;
    const derivedCagesWithNoObviousOverlap = inputAndDerivedCagesArea.overlappingCages.filter(
        cage => usedCellIndices.doesNotHaveAny(cage.cellIndicesCheckingSet));
    if (derivedCagesWithNoObviousOverlap.length === 0) {
        return inputAndDerivedCagesArea;
    } else {
        return stage3_maximizeNonOverlappingArea(allCages, new Context(
            derivedCagesWithNoObviousOverlap,
            absMaxAreaCellCount,
            inputAndDerivedCagesArea.nonOverlappingCagesAreaModel
        ));
    }
};

const stage3_maximizeNonOverlappingArea = (allCages: ReadonlyCages, ctx: Context): GridAreaModel => {
    stage4_recursiveInclusionExclusion(0, ctx);

    return {
        nonOverlappingCagesAreaModel: ctx.buildMaxNonOverlappingCagesAreaModel(),
        overlappingCages: ctx.buildOverlappingCages(allCages)
    };
};

const stage4_recursiveInclusionExclusion = (step: number, ctx: Context) => {
    if (ctx.usedCellCount > ctx.absMaxAreaCellCount) {
        return;
    } else if (ctx.usedCellCount > ctx.maxAreaCellCount) {
        if (ctx.saveNewMaxNonOverlappingArea()) {
            return;
        }
    }

    if (step === ctx.cageCount) {
        return;
    }

    const cage = ctx.cages[step];

    if (ctx.usedCellIndices.doesNotHaveAny(cage.cellIndicesCheckingSet)) {
        // with cage / recursively
        ctx.usedCellIndices.add(cage.cellIndicesCheckingSet);
        ctx.usedCages.add(cage);
        ctx.usedCellCount += cage.cellCount;
        stage4_recursiveInclusionExclusion(step + 1, ctx);
        if (ctx.found) return;

        // without cage / recursively
        ctx.usedCellIndices.remove(cage.cellIndicesCheckingSet);
        ctx.usedCages.delete(cage);
        ctx.usedCellCount -= cage.cellCount;
    }

    stage4_recursiveInclusionExclusion(step + 1, ctx);
    if (ctx.found) return;
};
