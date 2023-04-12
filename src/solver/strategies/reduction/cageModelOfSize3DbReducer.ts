import * as fs from 'node:fs';
import { parse } from 'yaml';
import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet, SudokuNumsSet } from '../../sets';
import { CageModelOfSize3FullReducer } from './archive/cageModelOfSize3FullReducer';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';
import { CageSizeNReductionsDb } from './db/reductionDb';

/**
 * Type alias for pre-coded denormalized reducing function
 * with hardcoded actions relevant to the specific `Combo` numbers in the `CellModel`s.
 */
type DenormalizedTacticalReducer = (
    reduction: MasterModelReduction,
    cageM: CageModel,
    combosSet: CombosSet,
    combo: Combo,
    cellM1: CellModel,
    cellM2: CellModel,
    cellM3: CellModel
) => void;

const dbString = fs.readFileSync('./src/solver/strategies/reduction/db/cage3_reductions.yaml', 'utf-8');
const db = parse(dbString) as CageSizeNReductionsDb;
const DENORMALIZED_TACTICAL_REDUCERS_FOR_SUM_OF_6: ReadonlyArray<DenormalizedTacticalReducer> = db.sums[0].combos[0].entries.map(entry => {
    if (entry.isValid) {
        if (entry.actions) {
            const cellM1DeletedNums = entry.actions.deleteNumsInCell1 ? SudokuNumsSet.of(...entry.actions.deleteNumsInCell1) : undefined;
            const cellM2DeletedNums = entry.actions.deleteNumsInCell2 ? SudokuNumsSet.of(...entry.actions.deleteNumsInCell2) : undefined;
            const cellM3DeletedNums = entry.actions.deleteNumsInCell3 ? SudokuNumsSet.of(...entry.actions.deleteNumsInCell3) : undefined;
            return (reduction, cageM, _combosSet, _combo, cellM1, cellM2, cellM3) => {
                if (cellM1DeletedNums) {
                    reduction.deleteNumOpts(cellM1, cellM1DeletedNums, cageM);
                }
                if (cellM2DeletedNums) {
                    reduction.deleteNumOpts(cellM2, cellM2DeletedNums, cageM);
                }
                if (cellM3DeletedNums) {
                    reduction.deleteNumOpts(cellM3, cellM3DeletedNums, cageM);
                }
            };
        } else {
            return NOTHING_TO_REDUCE;
        }
    } else {
        return IMPOSSIBLE_TO_REDUCE;
    }
});

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModelOfSize3DbReducer implements CageModelReducer {

    /**
     * The {@link CageModel} to reduce.
     */
    private readonly _cageM: CageModel;

    /**
     * The first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM1: CellModel;

    /**
     * The second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM2: CellModel;

    /**
     * The third {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM3: CellModel;

    private readonly _delegate: CageModelReducer;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._cellM1 = cageM.cellMs[0];
        this._cellM2 = cageM.cellMs[1];
        this._cellM3 = cageM.cellMs[2];
        this._delegate = new CageModelOfSize3FullReducer(cageM);
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const denormalizedReducers = DENORMALIZED_TACTICAL_REDUCERS_FOR_SUMS[this._cageM.cage.sum];
        if (denormalizedReducers) {
            //
            // [PERFORMANCE] Storing possible numbers for both `CellModel`s as bit masks
            // for efficient low-level number check and manipulation.
            //
            const cellM1NumsBits = this._cellM1._numOptsSet.bitStore;
            const cellM2NumsBits = this._cellM2._numOptsSet.bitStore;
            const cellM3NumsBits = this._cellM3._numOptsSet.bitStore;

            const combosSet = this._cageM.comboSet;
            const combo = combosSet.combos[0];

            // [PERFORMANCE] Storing `Combo`'s unique numbers to access the object once for each number.
            const num1 = combo.number1;
            const num2 = combo.number2;
            const num3 = combo.number3;

            const compressedNumbersPresenceState =
                    ((cellM1NumsBits & (1 << num1)) >> num1) |
                    ((cellM1NumsBits & (1 << num2)) >> (num2 - 1)) |
                    ((cellM1NumsBits & (1 << num3)) >> (num3 - 2)) |
                    (
                        ((cellM2NumsBits & (1 << num1)) >> num1) |
                        ((cellM2NumsBits & (1 << num2)) >> (num2 - 1)) |
                        ((cellM2NumsBits & (1 << num3)) >> (num3 - 2))
                    ) << 3 |
                    (
                        ((cellM3NumsBits & (1 << num1)) >> num1) |
                        ((cellM3NumsBits & (1 << num2)) >> (num2 - 1)) |
                        ((cellM3NumsBits & (1 << num3)) >> (num3 - 2))
                    ) << 6;

            denormalizedReducers[compressedNumbersPresenceState](
                reduction, this._cageM, combosSet, combo,
                this._cellM1, this._cellM2, this._cellM3
            );
        } else {
            this._delegate.reduce(reduction);
        }
    }

}

const DENORMALIZED_TACTICAL_REDUCERS_FOR_SUMS: ReadonlyArray<ReadonlyArray<DenormalizedTacticalReducer> | undefined> = [
    // Sum of 0 = no reducers.
    undefined,
    // Sum of 1 = no reducers.
    undefined,
    // Sum of 2 = no reducers.
    undefined,
    // Sum of 3 = no reducers.
    undefined,
    // Sum of 4 = no reducers.
    undefined,
    // Sum of 5 = no reducers.
    undefined,
    // Sum of 6 = reducers for `Combo` of [1, 2, 3].
    DENORMALIZED_TACTICAL_REDUCERS_FOR_SUM_OF_6
];

/**
 * Empty reducing function.
 */
function NOTHING_TO_REDUCE() {
    // No-op.
}

/**
 * Throwing reducing function which is executed if the combination of numbers is not possible.
 */
function IMPOSSIBLE_TO_REDUCE() {
    throw new InvalidSolverStateError('Met compressed numbers state which should not be possible');
}
