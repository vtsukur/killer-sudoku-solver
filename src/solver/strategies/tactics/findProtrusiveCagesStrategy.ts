import { Cage } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Column } from '../../../puzzle/column';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from '../../../puzzle/grid';
import { House } from '../../../puzzle/house';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Nonet } from '../../../puzzle/nonet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Puzzle } from '../../../puzzle/puzzle';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Row } from '../../../puzzle/row';
import { CageModel } from '../../models/elements/cageModel';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MasterModel, MasterModelEvents } from '../../models/masterModel';
import { CageSlicer } from '../../transform/cageSlicer';
import { Context } from '../context';
import { Strategy } from '../strategy';

/**
 * Configuration options for {@link FindProtrusiveCagesStrategy}.
 *
 * Can be used for both tuning production execution as well as tailoring testing scenarios.
 *
 * @public
 */
export type Config = {

    /**
     * Maximum amount of {@link Cell}s in a _protrusive_ {@link Cage}
     * to consider such a {@link Cage} as successful search result.
     *
     * The smaller the {@link Cage} the more hints it leads to.
     * As a result, there is a limited sense of finding bigger {@link Cage}s
     * as it requires more execution power and memory with less amount produced hints
     * UNLESS determining all possible hints is critical.
     *
     * Should be in the range of `[1, 9]`.
     *
     * Default value is `5`.
     */
    readonly maxMeaningfulProtrusionSize: number;

}

/**
 * Default {@link Config} options.
 *
 * When changing these defaults, TSDoc for {@link Config} should be updated as well.
 */
const DEFAULT_CONFIG: Config = Object.freeze({
    maxMeaningfulProtrusionSize: 5
});

/**
 * {@link Strategy} for solving the Killer Sudoku {@link Puzzle}
 * which finds _protrusive_ {@link Cage}s for {@link Nonet}s
 * and registers them in the {@link MasterModel}.
 *
 * _Protrusive_ {@link Cage} for a particular {@link Nonet} is determined in the following way:
 *
 *  1) A set of all _input_ _non-overlapping_ {@link Cage}s which
 * contain {@link Nonet}'s {@link Cell}(s) are found. Let's call it `CAGES`:
 *  - Such a set must contain ALL {@link Nonet}'s {@link Cell}s;
 *  - Such a set might also contain {@link Cell}s which do NOT belong to a {@link Nonet}
 * since a {@link Cage} containing {@link Nonet} {@link Cell}(s)
 * does NOT necessarily reside within the {@link Nonet} _fully_.
 *  2) All {@link Cell}s which do NOT belong to a {@link Nonet} are becoming a part of
 * the _protrusive_ {@link Cage}.
 *  - The sum of such a _protrusive_ {@link Cage} will be
 * the difference between the sum of `CAGES` and the sum of all numbers in a {@link Nonet} (`45`);
 *  - These {@link Cell}s may have duplicate numbers.
 *
 * For example, let us consider a {@link Nonet} of index `0`
 * (topmost leftmost {@link Nonet} in the {@link Grid}) with the following {@link Cell}s:
 * ```
 * // (row, column)
 * (0, 0), (0, 1), (0, 2)
 * (1, 0), (1, 1), (1, 2)
 * (2, 0), (2, 1), (2, 2)
 * ```
 *
 * Let us assume the following set of _input_ _non-overlapping_ {@link Cage}s
 * include all {@link Cell}s of {@link Nonet} of index `0`:
 * ```
 * Cage 1. Sum: 14. Cells: (0, 0), (0, 1)
 * Cage 2. Sum: 15. Cells: (0, 2), (0, 3)
 * Cage 3. Sum: 3.  Cells: (1, 0), (1, 1)
 * Cage 4. Sum: 8.  Cells: (1, 2), (1, 3)
 * Cage 5. Sum: 13. Cells: (2, 0), (2, 1), (2, 2)
 * ```
 *
 * It can be observed, that {@link Cage}s `2` and `4` contain 2 {@link Cell}s
 * which reside outside of the {@link Nonet} of index `0`:
 * ```
 * // (row, column)
 * (0, 3), (1, 3)
 * ```
 * These 2 {@link Cell}s describe the _protrusive_ {@link Cage} to {@link Nonet} of index `0`,
 * and it is trivial to derive sum of the _protrusive_ {@link Cage}:
 * ```
 * Protrusive Cage. Sum: 8 (calculated as 14 + 15 + 3 + 8 + 13 - 45 = 8). Cells: (0, 3), (1, 3)
 * ```
 *
 * Such a _protrusive_ {@link Cage} reduces possible numbers for its {@link Cell}s at `(0, 3)` and `(1, 3)`,
 * to `1`, `2`, `3`, `5`, `6`, `7` (unique Sudoku numbers that add up to `8`)
 * and excludes `4`, `8` and `9`.
 * This is an extra hint for {@link Column} of index `3` and {@link Nonet} of index `1`,
 * which was NOT evident from original input.
 *
 * The protrusive {@link Cage} in the example above must have unique numbers
 * as it lies within {@link Column} of index `3` (and {@link Nonet} of index `1`).
 * But, as initially stated in the definition of protrusive {@link Cage} this is NOT always the case.
 *
 * Let us consider another example for the same {@link Nonet} of index `0`.
 *
 * Let us assume the following set of _input_ _non-overlapping_ {@link Cage}s
 * include all {@link Cell}s of {@link Nonet} of index `0`:
 * ```
 * Cage 1. Sum: 14. Cells: (0, 0), (0, 1)
 * Cage 2. Sum: 15. Cells: (0, 2), (0, 3)
 * Cage 3. Sum: 3.  Cells: (1, 0), (1, 1), (1, 2)
 * Cage 4. Sum: 13. Cells: (2, 0), (2, 1)
 * Cage 5. Sum: 8.  Cells: (2, 2), (3, 2)
 * ```
 *
 * It can be observed, that {@link Cage}s `2` and `5` contain 2 {@link Cell}s
 * which reside outside of the {@link Nonet} of index `0`:
 * ```
 * // (row, column)
 * (0, 3), (3, 2)
 * ```
 * These 2 {@link Cell}s describe the _protrusive_ {@link Cage} to {@link Nonet} of index `0`,
 * and it is trivial to derive sum of the _protrusive_ {@link Cage}:
 * ```
 * Protrusive Cage. Sum: 8 (calculated as 14 + 15 + 3 + 13 + 8 - 45 = 8). Cells: (0, 3), (3, 2)
 * ```
 *
 * These 2 {@link Cell}s are NOT within the same {@link House}
 * (neither {@link Row}, nor {@link Column} or {@link Nonet})
 * so they MIGHT contain duplicates.
 * Still, such a _protrusive_ {@link Cage} reduces possible numbers for its {@link Cell}s at `(0, 3)` and `(3, 2)`,
 * limits possible numbers to `1`, `2`, `3`, `4`, `5`, `6`, `7`
 * and excludes `8` and `9` as possible numbers in those {@link Cell}s.
 * `4` is an option for both {@link Cell}s at `(0, 3)` and `(3, 2)` since it adds up to `8`
 * driven by the possibility of having non-unique numbers.
 * Still, this is an extra hint, which was also NOT evident from original input.
 *
 * {@link Nonet}s are analyzed only individually meaning
 * adjacent {@link Nonet} areas are NOT taken into account.
 *
 * This strategy is an _initialization_ strategy,
 * so it is applied just once on the particular {@link Puzzle}.
 *
 * The way this strategy works can be configured by {@link Config} options.
 *
 * @see {Config}
 *
 * @public
 */
export class FindProtrusiveCagesStrategy extends Strategy {

    private readonly _config: Config;

    private readonly _nonetAreasProcesser: NonetProcessor;

    constructor(context: Context, config: Config = DEFAULT_CONFIG) {
        super(context);

        this._config = { ...DEFAULT_CONFIG, ...config };

        this._nonetAreasProcesser = new NonetProcessor(this._model, this._context.cageSlicer, this._config.maxMeaningfulProtrusionSize);
    }

    execute() {
        this._nonetAreasProcesser.execute();
    }

}

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
        const nonetCageMsMap = new Map();
        this._model.nonetModels.forEach(nonetM => {
            nonetCageMsMap.set(nonetM.index, new Set());
        });

        for (const cageM of this._model.cageModelsMap.values()) {
            for (const cellM of cageM.cellMs) {
                nonetCageMsMap.get(cellM.cell.nonet).add(cageM);
            }
        }

        const cageRegisteredEventHandler = (cageM: CageModel) => {
            if (cageM.cage.isInput) {
                for (const cellM of cageM.cellMs) {
                    nonetCageMsMap.get(cellM.cell.nonet).add(cageM);
                }
            }
        };
        const cageUnregisteredEventHandler = (cageM: CageModel) => {
            if (cageM.cage.isInput) {
                for (const cellM of cageM.cellMs) {
                    nonetCageMsMap.get(cellM.cell.nonet).delete(cageM);
                }
            }
        };
        this._model.addEventHandler(MasterModelEvents.CAGE_REGISTERED, cageRegisteredEventHandler);
        this._model.addEventHandler(MasterModelEvents.CAGE_UNREGISTERED, cageUnregisteredEventHandler);

        for (const entry of nonetCageMsMap.entries()) {
            const index = entry[0];
            const cageMs = entry[1];

            const redundantCells = [];
            let cagesSum = 0;
            for (const cageM of cageMs) {
                for (const cellM of cageM.cellMs) {
                    const cell = cellM.cell;
                    if (cell.nonet !== index) {
                        redundantCells.push(cell);
                    }
                }
                cagesSum += cageM.cage.sum;
            }

            if (redundantCells.length > 0 && redundantCells.length <= this._maxMeaningfulProtrusionSize) {
                const cage = Cage.ofSum(cagesSum - House.SUM).withCells(redundantCells).setIsInput(this._model.isDerivedFromInputCage(redundantCells)).new();
                this._cageSlicer.addAndSliceResidualCageRecursively(cage);
            }
        }

        this._model.removeEventHandler(MasterModelEvents.CAGE_REGISTERED, cageRegisteredEventHandler);
        this._model.removeEventHandler(MasterModelEvents.CAGE_UNREGISTERED, cageUnregisteredEventHandler);
    }

}
