import { Cage } from '../../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Column } from '../../../../puzzle/column';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from '../../../../puzzle/grid';
import { House, HouseIndex } from '../../../../puzzle/house';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Nonet } from '../../../../puzzle/nonet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Puzzle } from '../../../../puzzle/puzzle';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Row } from '../../../../puzzle/row';
import { CageModel } from '../../../models/elements/cageModel';
import { CellModel } from '../../../models/elements/cellModel';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CageRegisteredEventHandler, CageUnregisteredEventHandler, MasterModel, MasterModelEvents } from '../../../models/masterModel';
import { CageSlicer } from '../../../transform/cageSlicer';
import { Context } from '../../context';
import { Strategy } from '../../strategy';

/**
 * Configuration options for {@link FindProtrusiveCagesStrategy}
 * help tune production execution and tailor testing scenarios.
 *
 * @public
 */
export type Config = {

    /**
     * The maximum amount of {@link Cell}s in a _protrusive_ {@link Cage}
     * to consider such a {@link Cage} as a successful search result.
     *
     * The smaller the {@link Cage}, the more hints it generates.
     * As a result, there is a limited sense of finding bigger {@link Cage}s
     * as it requires more execution power and memory with fewer produced suggestions
     * *unless* determining all possible hints is critical.
     *
     * It should be in the range of `[1, 9]`.
     *
     * The default value is `5`.
     */
    readonly maxMeaningfulProtrusionSize: number;

}

/**
 * Default {@link Config} options.
 *
 * Changing these defaults requires updating TSDoc for {@link Config}.
 */
const DEFAULT_CONFIG: Config = Object.freeze({
    maxMeaningfulProtrusionSize: 5
});

/**
 * This {@link Strategy} for solving the Killer Sudoku {@link Puzzle}
 * finds _protrusive_ {@link Cage}s for {@link Nonet}s
 * and registers them in the {@link MasterModel}.
 *
 * A _protrusive_ {@link Cage} for a particular {@link Nonet} is defined as follows:
 *
 *  1) All _input_ _non-overlapping_ {@link Cage}s
 * containing {@link Nonet}'s {@link Cell}(s) are found. Let's call it `CAGES`:
 *  - Such a set must contain ALL {@link Nonet}'s {@link Cell}s;
 *  - Such a set might also contain {@link Cell}s that do *not* belong to a {@link Nonet}
 * since a {@link Cage} containing {@link Nonet} {@link Cell}(s)
 * does *not* necessarily reside within the {@link Nonet} _entirely_.
 *  2) All {@link Cell}s which do *not* belong to a {@link Nonet} are becoming a part of
 * the _protrusive_ {@link Cage}.
 *  - The sum of such a _protrusive_ {@link Cage} will be
 * the difference between the sum of `CAGES` and the sum of all numbers in a {@link Nonet} (`45`);
 *  - These {@link Cell}s *may have* duplicate numbers.
 *
 * For example, let us consider a {@link Nonet} of index `0`
 * (topmost leftmost {@link Nonet} in the {@link Grid}) with the following {@link Cell}s:
 *
 * ```
 * // (row, column)
 * (0, 0), (0, 1), (0, 2)
 * (1, 0), (1, 1), (1, 2)
 * (2, 0), (2, 1), (2, 2)
 * ```
 *
 * Let us assume the following _input_ _non-overlapping_ {@link Cage}s
 * include all {@link Cell}s of {@link Nonet} of index `0`:
 *
 * ```
 * Cage 1. Sum: 14. Cells: (0, 0), (0, 1)
 * Cage 2. Sum: 15. Cells: (0, 2), (0, 3)
 * Cage 3. Sum: 3.  Cells: (1, 0), (1, 1)
 * Cage 4. Sum: 8.  Cells: (1, 2), (1, 3)
 * Cage 5. Sum: 13. Cells: (2, 0), (2, 1), (2, 2)
 * ```
 *
 * One can observe that {@link Cage}s `2` and `4` contain 2 {@link Cell}s
 * that reside outside of the {@link Nonet} of index `0`:
 *
 * ```
 * // (row, column)
 * (0, 3), (1, 3)
 * ```
 *
 * These 2 {@link Cell}s describe the _protrusive_ {@link Cage} to {@link Nonet} of index `0`,
 * and it is trivial to derive the sum of the _protrusive_ {@link Cage}:
 *
 * ```
 * Protrusive Cage. Sum: 8 (calculated as 14 + 15 + 3 + 8 + 13 - 45 = 8). Cells: (0, 3), (1, 3)
 * ```
 *
 * Such a _protrusive_ {@link Cage} reduces possible numbers for its {@link Cell}s
 * to `1`, `2`, `3`, `5`, `6`, and `7` (unique Sudoku numbers that add up to `8`)
 * and excludes `4`, `8`, and `9`.
 * This extra hint for {@link Column} of index `3` and {@link Nonet} of index `1`
 * was *not* evident from the original input.
 *
 * The _protrusive_ {@link Cage} in the example above must have unique numbers
 * as it lies within {@link Column} of index `3` (and {@link Nonet} of index `1`).
 * But, as initially stated in the definition of _protrusive_ {@link Cage},
 * this is only *sometimes* the case.
 *
 * Let us consider another example for the same {@link Nonet} of index `0`.
 *
 * Let us assume the following _input_ _non-overlapping_ {@link Cage}s
 * include all {@link Cell}s of {@link Nonet} of index `0`:
 *
 * ```
 * Cage 1. Sum: 14. Cells: (0, 0), (0, 1)
 * Cage 2. Sum: 15. Cells: (0, 2), (0, 3)
 * Cage 3. Sum: 3.  Cells: (1, 0), (1, 1), (1, 2)
 * Cage 4. Sum: 13. Cells: (2, 0), (2, 1)
 * Cage 5. Sum: 8.  Cells: (2, 2), (3, 2)
 * ```
 *
 * One can observe that {@link Cage}s `2` and `5` contain 2 {@link Cell}s
 * that reside outside of the {@link Nonet} of index `0`:
 *
 * ```
 * // (row, column)
 * (0, 3), (3, 2)
 * ```
 *
 * These 2 {@link Cell}s describe the _protrusive_ {@link Cage} to {@link Nonet} of index `0`,
 * and it is trivial to derive the sum of the _protrusive_ {@link Cage}:
 *
 * ```
 * Protrusive Cage. Sum: 8 (calculated as 14 + 15 + 3 + 13 + 8 - 45 = 8). Cells: (0, 3), (3, 2)
 * ```
 *
 * These 2 {@link Cell}s are *not* within the same {@link House}
 * (neither {@link Row} nor {@link Column} nor {@link Nonet})
 * so they *might* contain duplicates.
 * Still, such a _protrusive_ {@link Cage} reduces possible numbers for its {@link Cell}s
 * to `1`, `2`, `3`, `4`, `5`, `6`, and `7`
 * and excludes `8` and `9` as possible numbers in those {@link Cell}s.
 * `4` is an option for both {@link Cell}s at `(0, 3)` and `(3, 2)` since it adds up to `8`
 * driven by the possibility of having non-unique numbers.
 * Still, this extra hint was also *not* evident from the original input.
 *
 * {@link Nonet}s are analyzed *only* individually.
 * This {@link Strategy} does not explore adjacent {@link Nonet} areas.
 *
 * This type represents the _initialization_ {@link Strategy} applied at most once
 * at the beginning of solving process for a particular {@link Puzzle}.
 *
 * {@link Config} options allow configuring the way this {@link Strategy} works.
 *
 * @see Config
 *
 * @public
 */
export class FindProtrusiveCagesStrategy extends Strategy {

    private readonly _config: Config;
    private readonly _nonetAreasProcessor: NonetProcessor;

    /**
     * Constructs new {@link Strategy} with the given solution {@link Context}
     * and {@link Config} options.
     *
     * @param context - Solution {@link Context}.
     * @param config - {@link Config} options to apply on top of the defaults.
     *
     * @see Strategy.constructor
     */
    constructor(context: Context, config: Config = DEFAULT_CONFIG) {
        super(context);

        this._config = { ...DEFAULT_CONFIG, ...config };
        this._nonetAreasProcessor = new NonetProcessor(this._model, this._context.cageSlicer, this._config.maxMeaningfulProtrusionSize);
    }

    /**
     * @see Strategy.execute
     */
    execute() {
        this._nonetAreasProcessor.execute();
    }

}

/**
 * Tracks {@link CageModel}s indexed by {@link Nonet}.
 *
 * Tracking is needed since {@link Cage}s are being registered and unregistered
 * when _protrusive_ {@link Cage}s are found and {@link Cage} slicing occurs.
 * Tracking is achieved by using event handlers on {@link MasterModel}.
 *
 * Use of this data structure enhances implementation performance
 * since indexing allows faster enumeration of {@link CageModel}s by {@link Nonet} index
 * as opposed to full enumeration of {@link CageModel}s present within the {@link MasterModel}.
 */
class NonetTouchingCagesTracker {

    private readonly _model: MasterModel;
    private readonly _cageModels: Array<Set<CageModel>>;

    private readonly _cageRegisteredEventHandler: CageRegisteredEventHandler = (cageM: CageModel) => {
        this.addCageM(cageM);
    };

    private readonly _cageUnregisteredEventHandler: CageUnregisteredEventHandler = (cageM: CageModel) => {
        this.deleteCageM(cageM);
    };

    constructor(model: MasterModel) {
        this._model = model;
        this._cageModels = this._model.nonetModels.map(() => new Set());
        for (const cageM of this._model.cageModelsMap.values()) {
            this.addCageM(cageM);
        }
    }

    get cageModels(): ReadonlyArray<ReadonlySet<CageModel>> {
        return this._cageModels;
    }

    private addCageM(cageM: CageModel) {
        //
        // Algorithm requires `Cage`s to be _non-overlapping_ with each other,
        // so only _input_ `Cage`s are processed.
        //
        if (cageM.cage.isInput) {
            if (cageM.positioningFlags.isWithinNonet) {
                // [perf] Adding `Nonet`-only `Cage` is simpler: NO need to iterate over each `Cell`.
                this.cageMsByCageM(cageM).add(cageM);
            } else {
                // `Cage`s which touch more than 1 `Nonet` has to be iterated over fully.
                for (const cellM of cageM.cellMs) {
                    this.cageMsByCellM(cellM).add(cageM);
                }
            }
        }
    }

    private deleteCageM(cageM: CageModel) {
        //
        // Algorithm requires `Cage`s to be _non-overlapping_ with each other,
        // so only _input_ `Cage`s are processed.
        //
        if (cageM.cage.isInput) {
            //
            // As opposed to `addCageM` method, this implementation
            // does *not* check `Cage` to be within 1 `Nonet`
            // because there are NO circumstances under which such a `Cage`
            // will be actually deleted as a result of slicing.
            //
            // In other words, the `Strategy` will *not* slice `Nonet` `Cage`s.
            //
            for (const cellM of cageM.cellMs) {
                this.cageMsByCellM(cellM).delete(cageM);
            }
        }
    }

    private cageMsByCellM(cellM: CellModel) {
        return this._cageModels[cellM.cell.nonet];
    }

    private cageMsByCageM(cageM: CageModel) {
        return this._cageModels[cageM.anyNonet()];
    }

    attachEventHandlers() {
        this._model.addEventHandler(MasterModelEvents.CAGE_REGISTERED, this._cageRegisteredEventHandler);
        this._model.addEventHandler(MasterModelEvents.CAGE_UNREGISTERED, this._cageUnregisteredEventHandler);
    }

    deattachEventHandlers() {
        this._model.removeEventHandler(MasterModelEvents.CAGE_REGISTERED, this._cageRegisteredEventHandler);
        this._model.removeEventHandler(MasterModelEvents.CAGE_UNREGISTERED, this._cageUnregisteredEventHandler);
    }

}

/**
 * Processor for {@link Nonet} areas
 * which defines key work of the overall {@link FindProtrusiveCagesStrategy}.
 *
 * The focus is around finding and registering _protrusive_ {@link Cage}s.
 */
class NonetProcessor {

    private readonly _model: MasterModel;
    private readonly _cageSlicer: CageSlicer;
    private readonly _maxMeaningfulProtrusionSize: number;

    constructor(model: MasterModel, cageSlicer: CageSlicer, maxMeaningfulProtrusionSize: number) {
        this._model = model;
        this._cageSlicer = cageSlicer;
        this._maxMeaningfulProtrusionSize = maxMeaningfulProtrusionSize;
    }

    execute() {
        const tracker = new NonetTouchingCagesTracker(this._model);
        try {
            //
            // Add event handlers to listen to `Cage` registration and unregistration
            // when _protrusive_ `Cage`s are found and `Cage` slicing occurs.
            // This is necessary because slicing results in addition and deletion of `Cage`s
            // which this class needs to be aware of.
            //
            tracker.attachEventHandlers();

            // Running core work.
            this.doExecute(tracker);
        } finally {
            // Cleanup of event handlers even if error is thrown to avoid broken state.
            tracker.deattachEventHandlers();
        }
    }

    /**
     * Executes key processing work by iterating over all {@link Nonet}s,
     * determining _protrusive_ {@link Cage}s for each and
     * registering such {@link Cage}s if they are considered to be meaningful.
     *
     * @param tracker - Tracks {@link CageModel}s indexed by {@link Nonet}.
     *
     * @see Config.maxMeaningfulProtrusionSize
     */
    private doExecute(tracker: NonetTouchingCagesTracker) {
        tracker.cageModels.forEach((cageMs, nonet: HouseIndex) => {
            const protrusion = this.determineMeaningfulProtrusion(cageMs, nonet);
            if (protrusion) {
                this._cageSlicer.addAndSliceResidualCageRecursively(protrusion);
            }
        });
    }

    /**
     * Determines _protrusive_ {@link Cage} for a particular {@link Nonet}
     * by finding all {@link Cell}s which are outside of the {@link Nonet}
     * and calculating the sum as the difference between the sum of
     * {@link Cage}s which have at least one {@link Cell} within the {@link Nonet}
     * and {@link House.SUM}.
     *
     * @param cageMs - {@link CageModel}s with {@link Cage}s
     * which have at least one {@link Cell} within the {@link Nonet}.
     * @param nonet - Index of the target {@link Nonet}.
     *
     * @returns _Protrusive_ {@link Cage} for a particular {@link Nonet} defined
     * by finding all {@link Cell}s which are outside of the {@link Nonet}
     * and calculating the sum as the difference between the sum of
     * {@link Cage}s which have at least one {@link Cell} within the {@link Nonet}
     * and {@link House.SUM} OR
     * `undefined` if:
     *
     * - Found _protrusive_ {@link Cage} is empty;
     * - Found _protrusive_ {@link Cage} has more {@link Cell}s than {@link Config.maxMeaningfulProtrusionSize}.
     * See {@link FindComplementingCagesStrategy} TSDoc for more info.
     */
    private determineMeaningfulProtrusion(cageMs: ReadonlySet<CageModel>, nonet: HouseIndex): Cage | undefined {
        const protrusiveCells = [];
        let cagesSum = 0;

        for (const cageM of cageMs) {
            //
            // [perf] `Nonet`-only `Cage` does *not* have protrusive `Cell`s by definition,
            // so analysis is performed only for `Cage`s which touch more than 1 `Nonet`.
            //
            if (!cageM.positioningFlags.isWithinNonet) {
                for (const cellM of cageM.cellMs) {
                    const cell = cellM.cell;
                    if (cell.nonet !== nonet) {
                        protrusiveCells.push(cell);
                    }
                }
            }
            cagesSum += cageM.cage.sum;
        }

        if (protrusiveCells.length > 0 && protrusiveCells.length <= this._maxMeaningfulProtrusionSize) {
            return Cage.ofSum(cagesSum - House.SUM)
                .withCells(protrusiveCells)
                .setIsInput(this._model.isDerivedFromInputCage(protrusiveCells))
                .new();
        }
    }

}
