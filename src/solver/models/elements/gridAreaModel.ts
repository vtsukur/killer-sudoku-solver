import { Cage, ReadonlyCages } from '../../../puzzle/cage';
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

    private readonly _cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet;
    private _sum = 0;

    constructor(
            readonly cages: ReadonlyCages,
            readonly cellCount: number,
            cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet) {
        this._cellIndicesCheckingSet = cellIndicesCheckingSet;
    }

    get sum() {
        // Lazy initialization is used instead of precomputation
        // since many usages of the area model does NOT need sum at all.
        return this._sum === 0 ? this._sum = this.cages.reduce((prev, current) => prev + current.sum, 0) : this._sum;
    }

    has(cell: Cell) {
        // Use of `ReadonlyCellIndicesCheckingSet` enables extremely fast check.
        return this._cellIndicesCheckingSet.hasAll(CellIndicesCheckingSet.of(cell.index));
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
            [], 0, CellIndicesCheckingSet.of()
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

const newGridAreaModelWithMaxNonOverlappingArea = (cages: ReadonlyCages, houseCount: number): GridAreaModel => {
    const absMaxAreaCellCount = houseCount * House.CELL_COUNT;

    const inputAndDerivedCagesArea = splitCagesIntoInputAndDerivedCagesArea(cages);
    const { inputCages, inputCagesCellCount, inputCagesCellsIndices, derivedCages } = inputAndDerivedCagesArea;

    if (inputCagesCellCount === absMaxAreaCellCount) {
        // If input `Cage`s cover the whole area then the maximum non-overlapping area has been already found
        // and it consists of these input `Cage`s.
        return {
            nonOverlappingCagesAreaModel: new PrecomputedNonOverlappingCagesAreaModelWithLazySum(
                inputCages, inputCagesCellCount, inputCagesCellsIndices
            ),
            overlappingCages: derivedCages
        };
    } else {
        return computeGridAreaModelWithMaxNonOverlappingArea(cages, absMaxAreaCellCount, inputAndDerivedCagesArea);
    }
};

type InputAndDerivedCagesArea = {
    inputCages: ReadonlyCages,
    inputCagesCellCount: number,
    inputCagesCellsIndices: CellIndicesCheckingSet,
    derivedCages: ReadonlyCages
}

const splitCagesIntoInputAndDerivedCagesArea = (cages: ReadonlyCages): InputAndDerivedCagesArea => {
    const inputCages = new Array<Cage>();
    let inputCagesCellCount = 0;

    const derivedCages = new Array<Cage>();

    for (const cage of cages) {
        if (cage.isInput) {
            inputCages.push(cage);
            inputCagesCellCount += cage.cells.length;
        } else {
            derivedCages.push(cage);
        }
    }

    const inputCagesCellsIndices = new CellIndicesCheckingSet();
    for (const inputCage of inputCages) {
        inputCagesCellsIndices.add(inputCage.cellIndicesCheckingSet);
    }

    return {
        inputCages,
        inputCagesCellCount,
        inputCagesCellsIndices,
        derivedCages,
    };
};

const computeGridAreaModelWithMaxNonOverlappingArea = (cages: ReadonlyCages, absMaxAreaCellCount: number, inputAndDerivedCagesArea: InputAndDerivedCagesArea): GridAreaModel => {
    const nonOverlappingDerivedCages = inputAndDerivedCagesArea.derivedCages.filter(cage => inputAndDerivedCagesArea.inputCagesCellsIndices.doesNotHaveAny(cage.cellIndicesCheckingSet));
    const ctx: Context = {
        allCages: nonOverlappingDerivedCages,
        absMaxAreaCellCount: absMaxAreaCellCount,
        cageCount: nonOverlappingDerivedCages.length,
        usedCages: new Set(inputAndDerivedCagesArea.inputCages),
        usedCellIndices: inputAndDerivedCagesArea.inputCagesCellsIndices,
        usedCellCount: inputAndDerivedCagesArea.inputCagesCellCount,
        maxAreaCages: new Set(inputAndDerivedCagesArea.inputCages),
        maxAreaCellCount: inputAndDerivedCagesArea.inputCagesCellCount,
        maxAreaCellIndices: inputAndDerivedCagesArea.inputCagesCellsIndices,
        found: false
    };
    recursiveWork(0, ctx);

    const cagesOfMaxNonOverlappingRegion = Array.from(ctx.maxAreaCages);
    const cagesOfOverlappingRegion = cages.filter(cage => !ctx.maxAreaCages.has(cage));

    return {
        nonOverlappingCagesAreaModel: new PrecomputedNonOverlappingCagesAreaModelWithLazySum(
            cagesOfMaxNonOverlappingRegion, ctx.maxAreaCellCount, ctx.maxAreaCellIndices
        ),
        overlappingCages: cagesOfOverlappingRegion
    };
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
