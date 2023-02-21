import { Cage, Cages, ReadonlyCages } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from '../../../puzzle/grid';
import { House } from '../../../puzzle/house';
import { ReadonlyCellIndicesCheckingSet } from '../../math';
import { CellIndicesCheckingSet } from '../../math/cellIndicesCheckingSet';

/**
 * Area of _non-overlapping_ {@link Cage}s within {@link GridAreaModel}.
 *
 * {@link Cage}s are considered _non-overlapping_ if they do NOT have {@link Cell}s
 * which are also present in other {@link Cage}s within {@link GridAreaModel}.
 *
 * @public
 */
export interface NonOverlappingCagesAreaModel {

    /**
     * _Non-overlapping_ {@link Cage}s within {@link GridAreaModel} which are a part of this area.
     *
     * {@link Cage}s are considered _non-overlapping_ if they do NOT have {@link Cell}s
     * which are also present in other {@link Cage}s within {@link GridAreaModel}.
     */
    readonly cages: ReadonlyCages;

    /**
     * Amount of {@link Cell}s in all _non-overlapping_ {@link cages} within this area.
     */
    readonly cellCount: number;

    /**
     * Checking set of {@link Cell} indices which has all
     * {@link Cell}s of _non-overlapping_ {@link cages} within {@link GridAreaModel} marked as _included_.
     */
    readonly cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet;

    /**
     * Sum of all _non-overlapping_ {@link cages} in this area.
     */
    readonly sum: number;

}

/**
 * {@link NonOverlappingCagesAreaModel} with all properties but {@link sum}
 * being precomputed externally and passed to constructor.
 *
 * Used internally by this module for intermediate area model construction
 * during staged processing.
 *
 * {@link sum} is computed on every access
 * since many usages of {@link NonOverlappingCagesAreaModel} does NOT need sum at all.
 * Lazy initialization of {@link sum} is omitted to avoid code complexity.
 * If the caller needs faster performance it is adviced to store and reuse computed value.
 */
class PartiallyPrecomputedNonOverlappingCagesAreaModel implements NonOverlappingCagesAreaModel {

    constructor(
            readonly cages: ReadonlyCages,
            readonly cellCount: number,
            readonly cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet) {
    }

    get sum() {
        return this.cages.reduce((prev, current) => prev + current.sum, 0);
    }

}

/**
 * {@link NonOverlappingCagesAreaModel} with all properties
 * being precomputed externally and passed to constructor.
 *
 * Designed for the external use for maximum performance.
 */
class PrecomputedNonOverlappingCagesAreaModel extends PartiallyPrecomputedNonOverlappingCagesAreaModel {

    private readonly _sum;

    constructor(
            cages: ReadonlyCages,
            cellCount: number,
            cellIndicesCheckingSet: ReadonlyCellIndicesCheckingSet) {
        super(cages, cellCount, cellIndicesCheckingSet);
        this._sum = super.sum;
    }

    get sum() {
        return this._sum;
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
 * which are also present in other {@link Cage}s within {@link GridAreaModel}.
 *
 * @public
 */
export interface GridAreaModel {

    /**
     * Area of _non-overlapping_ {@link Cage}s within this {@link GridAreaModel}.
     */
    readonly nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel;

    /**
     * {@link Cage}s which overlap with the area formed by {@link nonOverlappingCagesAreaModel}.
     */
    readonly overlappingCages: ReadonlyCages;

}

/**
 * Area on the {@link Grid} defined by a group of {@link Cage}s
 * which can be built by static factory method {@link from}.
 *
 * @public
 */
export class GridAreaModel implements GridAreaModel {

    private constructor(
        readonly nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel,
        readonly overlappingCages: ReadonlyCages) {}

    private static readonly _EMPTY_INSTANCE = new GridAreaModel(
        new PartiallyPrecomputedNonOverlappingCagesAreaModel(
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
     * which are also present in other {@link Cage}s within the same {@link GridAreaModel}.
     *
     * For performance reasons the following rules apply:
     *  - {@link Cage}s which have `Cage.input === true`
     * are always added to the {@link nonOverlappingCagesAreaModel} even it will result in finding
     * an area of a smaller size.
     *  - {@link Cage}s are NOT validated to be within the supposed area boundaries.
     * It is up to the caller to collect {@link Cage}s correctly with respect to the area boundaries.
     *
     * @param cages - {@link Cage}s to construct this {@link GridAreaModel} from.
     * @param houseCount - number of {@link House}s that the {@link GridAreaModel} covers.
     * Used to calculate possible upper bound of maximum area size which is `House.CELL_COUNT * houseCount`.
     *
     * @returns new area on the {@link Grid} defined by a group of the given {@link Cage}s.
     */
    static from(cages: ReadonlyCages, houseCount = 1): GridAreaModel {
        return cages.length !== 0 ? newGridAreaModelWithMaxNonOverlappingArea(cages, houseCount) : this._EMPTY_INSTANCE;
    }

}

const newGridAreaModelWithMaxNonOverlappingArea = (allCages: ReadonlyCages, houseCount: number): GridAreaModel => {
    const absMaxAreaCellCount = houseCount * House.CELL_COUNT;

    const inputAndDerivedCagesArea = stage1_splitCagesIntoInputAndDerivedCagesArea(allCages);
    if (inputAndDerivedCagesArea.nonOverlappingCagesAreaModel.cellCount === absMaxAreaCellCount ||
            inputAndDerivedCagesArea.overlappingCages.length === 0) {
        // If input `Cage`s cover the whole area OR there are no derived `Cage`s
        // then the maximum non-overlapping area has been already found and it consists of these input `Cage`s.
        return inputAndDerivedCagesArea;
    } else {
        return stage2_tryToMaximizeNonOverlappingArea(absMaxAreaCellCount, inputAndDerivedCagesArea);
    }
};

/**
 * First processing stage splits given {@link Cage}s into _input_ {@link Cage}s and _derived_ ones,
 * producing intermediate {@link GridAreaModel} with all _input_ {@link Cage}s being unconditionally added
 * to the area of _non-overlapping_ {@link Cage}s and all _derived_ {@link Cage}s added to _overlapping_ collection.
 *
 * Produced _non-overlapping_ area is NOT guaranteed to be maximized
 * as this stage does NOT process _derived_ {@link Cage}s which can potentially maximize _the non-overlapping_ area.
 *
 * @param allCages - All {@link Cage}s belonging to the area on the {@link Grid}.
 *
 * @returns Intermediate {@link GridAreaModel} with all _input_ {@link Cage}s being unconditionally added
 * to the area of _non-overlapping_ {@link Cage}s and all _derived_ {@link Cage}s added to _overlapping_ collection.
 */
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
        nonOverlappingCagesAreaModel: new PartiallyPrecomputedNonOverlappingCagesAreaModel(
            inputCages, inputCagesCellCount, inputCagesCellIndices
        ),
        overlappingCages: derivedCages
    };
};

/**
 * Second processing stage takes intermediate {@link GridAreaModel}
 * produced by {@link stage1_splitCagesIntoInputAndDerivedCagesArea}
 * and tries to maximize the _non-overlapping_ area by enriching it with _derived_ {@link Cage}s.
 *
 * @param absMaxAreaCellCount - The upper bound of maximum area size that the {@link GridAreaModel} covers.
 * @param inputAndDerivedCagesArea - The result of {@link stage1_splitCagesIntoInputAndDerivedCagesArea}.
 *
 * @returns The {@link GridAreaModel} with maximized _non-overlapping_ area
 * with all _input_ {@link Cage}s and (optionally) _derived_ {@link Cage}s having no shared {@link Cell}s.
 */
const stage2_tryToMaximizeNonOverlappingArea = (absMaxAreaCellCount: number, inputAndDerivedCagesArea: GridAreaModel): GridAreaModel => {
    const usedCellIndices = inputAndDerivedCagesArea.nonOverlappingCagesAreaModel.cellIndicesCheckingSet;
    const derivedCagesWithNoObviousOverlap = inputAndDerivedCagesArea.overlappingCages.filter(
        cage => usedCellIndices.doesNotHaveAny(cage.cellIndicesCheckingSet));

    if (derivedCagesWithNoObviousOverlap.length === 0) {
        // Absence of derived `Cage`s without obvious overlaps with non-overlapping area triggers short-circuit return:
        // there is NO need to execute expensive inclusion/exclusion algorithm to determine the maximum area.
        return inputAndDerivedCagesArea;
    } else {
        // Executing inclusion/exclusion algorithm for derived `Cage`s without obvious overlap.
        // Complexity is `O(2^n)` where `n` is the number of derived `Cage`s without obvious overlap.
        // In real-world scenarios `n` is usually be under `5` and for the most cases between `1` and `3`.
        return new Stage3_InclusionExclusionBasedFinderForMaxNonOverlappingArea(
            derivedCagesWithNoObviousOverlap,
            absMaxAreaCellCount,
            inputAndDerivedCagesArea.nonOverlappingCagesAreaModel
        ).find(inputAndDerivedCagesArea.overlappingCages);
    }
};

class Stage3_InclusionExclusionBasedFinderForMaxNonOverlappingArea {

    private readonly cageCount: number;
    private readonly usedCages: Cages;
    private usedCellCount: number;
    private readonly usedCellIndices: CellIndicesCheckingSet;
    private maxAreaCages: Cages;
    private maxAreaCellCount: number;
    private maxAreaCellIndices: ReadonlyCellIndicesCheckingSet;
    private found: boolean;

    constructor(readonly cages: ReadonlyCages,
            readonly absMaxAreaCellCount: number,
            nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel) {
        this.cageCount = cages.length;

        const {
            cages: inputCages,
            cellCount: inputCagesCellCount,
            cellIndicesCheckingSet: inputCagesCellIndicesCheckingSet
        } = nonOverlappingCagesAreaModel;
        this.usedCages = [...inputCages];
        this.usedCellCount = inputCagesCellCount;
        this.usedCellIndices = new CellIndicesCheckingSet(inputCagesCellIndicesCheckingSet);
        this.maxAreaCages = [...inputCages];
        this.maxAreaCellCount = inputCagesCellCount;
        this.maxAreaCellIndices = inputCagesCellIndicesCheckingSet;
        this.found = false;
    }

    find(derivedCages: ReadonlyCages) {
        this.doFind(0);

        return {
            nonOverlappingCagesAreaModel: this.buildMaxNonOverlappingCagesAreaModel(),
            overlappingCages: this.buildOverlappingCages(derivedCages)
        };
    }

    private doFind(step: number): boolean | undefined {
        if (this.hasNewMax) {
            if (this.saveNewMax()) {
                return true;
            }
        }

        if (this.isLastStep(step)) {
            return;
        }

        const cage = this.cages[step];

        if (this.canTakeCage(cage)) {
            // Recursively try to find new maximum WITH the current `Cage`.
            this.takeNonOverlappingCage(cage);
            if (this.doFind(step + 1)) {
                return true;
            }

            // Recursively try to find new maximum WITHOUT the current `Cage` ...
            this.removeNonOverlappingCage(cage);
        }
        // ... here comes the actual recursive try to find new maximum WITHOUT the current `Cage`.
        return this.doFind(step + 1);
    };

    private get hasNewMax() {
        return this.usedCellCount > this.maxAreaCellCount;
    }

    private saveNewMax() {
        this.maxAreaCellCount = this.usedCellCount;
        this.maxAreaCages = [...this.usedCages];
        this.maxAreaCellIndices = this.usedCellIndices.clone();
        if (this.usedCellCount === this.absMaxAreaCellCount) {
            this.found = true;
        }

        return this.found;
    }

    private isLastStep(step: number) {
        return this.cageCount === step;
    }

    private canTakeCage(cage: Cage) {
        return this.usedCellIndices.doesNotHaveAny(cage.cellIndicesCheckingSet);
    }

    private takeNonOverlappingCage(cage: Cage) {
        this.usedCellIndices.add(cage.cellIndicesCheckingSet);
        this.usedCages.push(cage);
        this.usedCellCount += cage.cellCount;
    }

    private removeNonOverlappingCage(cage: Cage) {
        this.usedCellIndices.remove(cage.cellIndicesCheckingSet);
        this.usedCages.pop();
        this.usedCellCount -= cage.cellCount;
    }

    private buildMaxNonOverlappingCagesAreaModel() {
        return new PrecomputedNonOverlappingCagesAreaModel(
            this.maxAreaCages, this.maxAreaCellCount, this.maxAreaCellIndices
        );
    }

    private buildOverlappingCages(derivedCages: ReadonlyCages) {
        // Simple `indexOf` check for small collections is faster than using `Set`s or `Map`s.
        return derivedCages.filter(cage => this.maxAreaCages.indexOf(cage) === -1);
    }

};
