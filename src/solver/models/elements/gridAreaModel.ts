import { Cage, Cages, ReadonlyCages } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from '../../../puzzle/grid';
import { House } from '../../../puzzle/house';
import { CellIndicesSet, ReadonlyCellIndicesSet } from '../../sets';
import { CageModel } from './cageModel';
import { NonOverlappingCagesAreaModel } from './nonOverlappingCagesAreaModel';

/**
 * {@link NonOverlappingCagesAreaModel} with all properties but {@link sum}
 * being precomputed externally and passed to the constructor.
 *
 * Used internally by this module for intermediate area model construction
 * during staged processing while finding area of _non-overlapping_ {@link Cage}s with maximum size.
 *
 * {@link sum} is computed on every access
 * since many usages of {@link NonOverlappingCagesAreaModel} does *not* need sum at all.
 * Lazy initialization of {@link sum} is omitted to avoid code complexity.
 * If the caller needs faster performance it is adviced to store and reuse computed value.
 */
class PartiallyPrecomputedNonOverlappingCagesAreaModel implements NonOverlappingCagesAreaModel {

    constructor(
            readonly cages: ReadonlyCages,
            readonly cellCount: number,
            readonly cellIndices: ReadonlyCellIndicesSet) {
    }

    get sum() {
        return this.cages.reduce((prev, current) => prev + current.sum, 0);
    }

}

/**
 * {@link NonOverlappingCagesAreaModel} with all properties
 * being precomputed externally and passed to constructor.
 *
 * Designed for the external use for maximum performance
 * as all values are referenced and *not* computed multiple times.
 */
class PrecomputedNonOverlappingCagesAreaModel extends PartiallyPrecomputedNonOverlappingCagesAreaModel {

    private readonly _sum;

    constructor(
            cages: ReadonlyCages,
            cellCount: number,
            cellIndices: ReadonlyCellIndicesSet) {
        super(cages, cellCount, cellIndices);
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
 *  - {@link Cage}s without shared {@link Cell}s forming area of maximized size.
 * Defined by {@link nonOverlappingCagesAreaModel}.
 *  - {@link Cage}s which have some {@link Cells}s shared
 * with the area formed by {@link nonOverlappingCagesAreaModel}.
 * Defined by {@link overlappingCages}.
 *
 * Maximization is required to minimize the area that complements it so that
 * it is possible to figure out hints for solving Killer Sudoku {@link Puzzle}.
 * Knowing the sum of {@link Cage}s in maximized area and the sum of the full area
 * allows to trivially determine the sum of complementing area and, in this way,
 * potentially restrict possible number options for the {@link Cell}s in the complementing area.
 *
 * @public
 */
export interface GridAreaModel {

    /**
     * Area of {@link Cage}s within {@link GridAreaModel} which do *not* have shared {@link Cell}s.
     */
    readonly nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel;

    /**
     * {@link Cage}s which have some {@link Cell}s shared
     * with the area formed by {@link nonOverlappingCagesAreaModel}.
     */
    readonly overlappingCages: ReadonlyCages;

}

/**
 * Area on the {@link Grid} defined by a group of {@link Cage}s
 * which can be built by static factory method {@link from} producing
 * maximized area of {@link Cage}s which do *not* have shared {@link Cell}s.
 *
 * @public
 */
export class GridAreaModel implements GridAreaModel {

    private constructor(
        readonly nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel,
        readonly overlappingCages: ReadonlyCages) {}

    private static readonly _EMPTY_INSTANCE = new GridAreaModel(
        new PartiallyPrecomputedNonOverlappingCagesAreaModel(
            [], 0, CellIndicesSet.newEmpty()
        ), []
    );

    /**
     * Constructs new area on the {@link Grid} defined by a group of the given {@link Cage}s
     * with {@link Cage}s without shared {@link Cell}s forming area of maximized size.
     *
     * {@link Cage}s are divided into two collections:
     *
     *  - {@link Cage}s without shared {@link Cell}s forming area of maximized size.
     * Defined by {@link nonOverlappingCagesAreaModel}.
     *  - {@link Cage}s which have some {@link Cells}s shared
     * with the area formed by {@link nonOverlappingCagesAreaModel}.
     * Defined by {@link overlappingCages}.
     *
     * For performance reasons the following rules apply:
     *
     *  - {@link Cage}s which have `Cage.isInput === true`
     * are always added to the {@link nonOverlappingCagesAreaModel} even it will result in finding
     * an area of a size smaller than potential maximum.
     *  - {@link Cage}s are *not* validated to be within the supposed area boundaries.
     *
     * It is up to the caller to collect {@link Cage}s correctly with respect to the area boundaries.
     *
     * @param cages - {@link Cage}s to construct this {@link GridAreaModel} from.
     * @param houseCount - Number of {@link House}s that the {@link GridAreaModel} covers.
     * Used to calculate possible upper bound of maximum area size which is `House.CELL_COUNT * houseCount`.
     *
     * @returns New area on the {@link Grid} defined by a group of the given {@link Cage}s
     * with {@link Cage}s without shared {@link Cell}s forming area of maximized size.
     */
    static from(cages: ReadonlyCages, houseCount = 1): GridAreaModel {
        return cages.length !== 0 ? newGridAreaModelWithMaxNonOverlappingArea(cages, houseCount) : this._EMPTY_INSTANCE;
    }

    /**
     * Same as {@link from} but uses array of {@link CageModel}s as input instead of the {@link Cage}s
     * to ease the client-side.
     *
     * @param cageMs
     * @param cages - {@link CageModel}s linked with {@link Cage}s to construct this {@link GridAreaModel} from.
     * @param houseCount - Number of {@link House}s that the {@link GridAreaModel} covers.
     * Used to calculate possible upper bound of maximum area size which is `House.CELL_COUNT * houseCount`.
     *
     * @returns New area on the {@link Grid} defined by a group of the given {@link Cage}s
     * with {@link Cage}s without shared {@link Cell}s forming area of maximized size.
     *
     * @see from
     */
    static fromCageModels(cageMs: ReadonlyArray<CageModel>, houseCount = 1): GridAreaModel {
        return cageMs.length !== 0 ? newGridAreaModelWithMaxNonOverlappingArea(this.cageModelsToCages(cageMs), houseCount) : this._EMPTY_INSTANCE;
    }

    private static cageModelsToCages(cageMs: ReadonlyArray<CageModel>) {
        return cageMs.map(cageM => cageM.cage);
    }

}

/**
 * Main entry point to the finder and builder of non-empty {@link GridAreaModel}.
 *
 * Runs 3 stages of processing:
 *
 * - {@link stage1_splitCagesIntoInputAndDerivedCagesArea}
 * (fast)
 * - {@link stage2_tryToMaximizeNonOverlappingArea}
 * (fast, skipped if prior stage is deterministic to the end result)
 * - {@link Stage3_InclusionExclusionBasedFinderForMaxNonOverlappingArea}
 * (slow, skipped if prior stages are deterministic to the end result)
 *
 * @param allCages - All {@link Cage}s belonging to the area on the {@link Grid}.
 * @param houseCount - Number of {@link House}s that the {@link GridAreaModel} covers.
 * Used to calculate possible upper bound of maximum area size which is `House.CELL_COUNT * houseCount`.
 *
 * @returns New area on the {@link Grid} defined by a group of the given {@link Cage}s.
 */
const newGridAreaModelWithMaxNonOverlappingArea = (allCages: ReadonlyCages, houseCount: number): GridAreaModel => {
    const cellCount = Math.imul(houseCount, House.CELL_COUNT);

    const inputAndDerivedCagesArea = stage1_splitCagesIntoInputAndDerivedCagesArea(allCages);
    if (inputAndDerivedCagesArea.nonOverlappingCagesAreaModel.cellCount === cellCount ||
            inputAndDerivedCagesArea.overlappingCages.length === 0) {
        // If input `Cage`s cover the whole area OR there are no _derived_ `Cage`s
        // then the maximum non-overlapping area has been already found and it consists of these input `Cage`s.
        return inputAndDerivedCagesArea;
    } else {
        return stage2_tryToMaximizeNonOverlappingArea(cellCount, inputAndDerivedCagesArea);
    }
};

/**
 * First processing stage splits given {@link Cage}s into _input_ {@link Cage}s and _derived_ ones,
 * producing intermediate {@link GridAreaModel} where all _input_ {@link Cage}s being unconditionally added
 * to the area of {@link Cage}s without shared {@link Cell}s (called _non-overlapping_ area)
 * and all _derived_ {@link Cage}s being added to _overlapping_ area.
 *
 * Produced _non-overlapping_ area is *not* guaranteed to be maximized
 * as this stage does *not* process _derived_ {@link Cage}s which can potentially maximize the _non-overlapping_ area.
 *
 * @param allCages - All {@link Cage}s belonging to the area on the {@link Grid}.
 *
 * @returns Intermediate {@link GridAreaModel} where all _input_ {@link Cage}s being unconditionally added
 * to the area of {@link Cage}s without shared {@link Cell}s
 * and all _derived_ {@link Cage}s being added to _overlapping_ collection.
 *
 * @see Cage.isInput
 */
const stage1_splitCagesIntoInputAndDerivedCagesArea = (allCages: ReadonlyCages): GridAreaModel => {
    const inputCages = new Array<Cage>();
    let inputCagesCellCount = 0;

    const derivedCages = new Array<Cage>();

    const inputCagesCellIndices = CellIndicesSet.newEmpty();
    for (const cage of allCages) {
        if (cage.isInput) {
            inputCages.push(cage);
            inputCagesCellIndices.addAll(cage.cellIndices);
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
 * @param absMaxAreaCellCount - Upper bound of maximum area size that the {@link GridAreaModel} covers.
 * @param inputAndDerivedCagesArea - Result of {@link stage1_splitCagesIntoInputAndDerivedCagesArea}.
 *
 * @returns {@link GridAreaModel} with maximized _non-overlapping_ area
 * with all _input_ {@link Cage}s and (optionally) _derived_ {@link Cage}s having no shared {@link Cell}s.
 */
const stage2_tryToMaximizeNonOverlappingArea = (absMaxAreaCellCount: number, inputAndDerivedCagesArea: GridAreaModel): GridAreaModel => {
    const usedCellIndices = inputAndDerivedCagesArea.nonOverlappingCagesAreaModel.cellIndices;

    // Checking _derived_ `Cage`s for obvious overlap with _non-overlapping_ area.
    // Obvious overlap is an overlap which can be determined with simple check of each individual _derived_ `Cage`
    // without full combinatorics of inclusion-exclusion approach and methods alike.
    // It potentially narrows down the collection to run heavier algorithms for.
    const derivedCagesWithNoObviousOverlap = inputAndDerivedCagesArea.overlappingCages.filter(
        cage => usedCellIndices.doesNotHaveAny(cage.cellIndices));

    if (derivedCagesWithNoObviousOverlap.length === 0) {
        // Absence of _derived_ `Cage`s without obvious overlaps with _non-overlapping_ area triggers short-circuit return:
        // there is NO need to execute heavy inclusion-exclusion algorithm to determine the maximum area.
        return inputAndDerivedCagesArea;
    } else {
        // Executing heavy inclusion-exclusion algorithm for _derived_ `Cage`s without obvious overlap.
        return new Stage3_InclusionExclusionBasedFinderForMaxNonOverlappingArea(
            derivedCagesWithNoObviousOverlap,
            absMaxAreaCellCount,
            inputAndDerivedCagesArea.nonOverlappingCagesAreaModel
        ).find(inputAndDerivedCagesArea.overlappingCages);
    }
};

/**
 * Third processing stage uses inclusion-exclusion principle
 * to find an area of maximum size with {@link Cage}s without shared {@link Cell}s.
 *
 * Complexity is `O(2^n)` where `n` is the number of _derived_ {@link Cage}s without _obvious overlap_.
 *
 * This algorithm is applied since the problem at hand appears to be NP-hard
 * (this statement still needs validation in the eyes of the author).
 * Minifying `n` is critical to make this stage performant,
 * which is actually achieved by the first two stages of processing:
 * {@link stage1_splitCagesIntoInputAndDerivedCagesArea} and {@link stage2_tryToMaximizeNonOverlappingArea}.
 * For real-world scenarios presence of these stages result in `n`
 * being between `1` and `3` for the most cases (80%) and in extreme case being slightly above `10`.
 *
 * This algorithm can be optimized further by applying more advanced algorithms
 * with the techniques from subset sum problem (SSP):
 *
 *  - Horowitz and Sahni: {@see https://en.wikipedia.org/wiki/Subset_sum_problem#Horowitz_and_Sahni}
 *  - Schroeppel and Shamir: {@see https://en.wikipedia.org/wiki/Subset_sum_problem#Schroeppel_and_Shamir}
 *  - Howgrave-Graham and Joux: {@see https://en.wikipedia.org/wiki/Subset_sum_problem#Howgrave-Graham_and_Joux}
 *
 * However, it is *not* worth the complexity given the prior stages of processing which minimize `n`.
 *
 * Still, faster alternatives can be considered if performance will prove to be slow.
 *
 * Currently the known most complex real-world case of `12` _derived_ `Cage`s result
 * in sub-millisecond execution on 2,3 GHz 8-Core Intel Core i9.
 *
 * @see https://en.wikipedia.org/wiki/Subset_sum_problem#Inclusion.E2.80.93exclusion
 * @see https://cp-algorithms.com/combinatorics/inclusion-exclusion.html#the-formulation-in-terms-of-probability-theory
 * @see https://en.wikipedia.org/wiki/Inclusion%E2%80%93exclusion_principle
 */
class Stage3_InclusionExclusionBasedFinderForMaxNonOverlappingArea {

    private readonly cageCount: number;
    private readonly usedCages: Cages;
    private usedCellCount: number;
    private readonly usedCellIndices: CellIndicesSet;
    private maxAreaCages: Cages;
    private maxAreaCellCount: number;
    private maxAreaCellIndices: ReadonlyCellIndicesSet;
    private foundAbsMax: boolean;

    constructor(readonly cages: ReadonlyCages,
            readonly absMaxAreaCellCount: number,
            nonOverlappingCagesAreaModel: NonOverlappingCagesAreaModel) {
        this.cageCount = cages.length;

        const {
            cages: inputCages,
            cellCount: inputCagesCellCount,
            cellIndices: inputCagesCellIndicesSet
        } = nonOverlappingCagesAreaModel;
        this.usedCages = [...inputCages];
        this.usedCellCount = inputCagesCellCount;
        this.usedCellIndices = new CellIndicesSet(inputCagesCellIndicesSet);
        this.maxAreaCages = [...inputCages];
        this.maxAreaCellCount = inputCagesCellCount;
        this.maxAreaCellIndices = inputCagesCellIndicesSet;
        this.foundAbsMax = false;
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
                // Short-circuit return when the first absolute maximum is found.
                return true;
            }
        }

        if (this.isLastStep(step)) {
            // Cannot go any deeper than the last step which does *not* have `Cage`s to advance on.
            return;
        }

        const cage = this.cages[step];

        if (this.canTakeCage(cage)) {
            // Recursively try to find new maximized area WITH the current `Cage`.
            this.takeNonOverlappingCage(cage);
            if (this.doFind(step + 1)) {
                return true;
            }

            // Recursively try to find new maximized area WITHOUT the current `Cage` ...
            this.deleteNonOverlappingCage(cage);
        }
        // ... here comes the actual recursive try to find new maximum area WITHOUT the current `Cage`.
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
            this.foundAbsMax = true;
        }

        return this.foundAbsMax;
    }

    private isLastStep(step: number) {
        return this.cageCount === step;
    }

    private canTakeCage(cage: Cage) {
        return this.usedCellIndices.doesNotHaveAny(cage.cellIndices);
    }

    private takeNonOverlappingCage(cage: Cage) {
        this.usedCellIndices.addAll(cage.cellIndices);
        this.usedCages.push(cage);
        this.usedCellCount += cage.cellCount;
    }

    private deleteNonOverlappingCage(cage: Cage) {
        this.usedCellIndices.deleteAll(cage.cellIndices);
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

}
