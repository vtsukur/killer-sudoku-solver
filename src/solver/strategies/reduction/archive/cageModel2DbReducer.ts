import * as fs from 'node:fs';
import { parse } from 'yaml';
import { CageModel } from '../../../models/elements/cageModel';
import { CellModel } from '../../../models/elements/cellModel';
import { SudokuNumsSet } from '../../../sets';
import { CageModelReducer } from '../cageModelReducer';
import { MasterModelReduction } from '../masterModelReduction';
import { CageSizeNReductionsDb } from '../db/reductionDb';

type ReductionState = {
    isValid: boolean;
    comboNumsBits: number;
    deleteNumsInCell1Bits: number;
    deleteNumsInCell2Bits: number;
    keepNumsInCell1Bits: number;
    keepNumsInCell2Bits: number;
};

const EMPTY_REDUCTION_STATE: ReductionState = {
    isValid: true,
    comboNumsBits: 0,
    deleteNumsInCell1Bits: 0,
    deleteNumsInCell2Bits: 0,
    keepNumsInCell1Bits: ~0,
    keepNumsInCell2Bits: ~0
};

const INVALID_REDUCTION_STATE: ReductionState = {
    isValid: false,
    comboNumsBits: 0,
    deleteNumsInCell1Bits: 0,
    deleteNumsInCell2Bits: 0,
    keepNumsInCell1Bits: 0,
    keepNumsInCell2Bits: 0
};

const dbString = fs.readFileSync('./src/solver/strategies/reduction/db/cage2_reductions.yaml', 'utf-8');
const db = parse(dbString) as CageSizeNReductionsDb;

const ALL_REDUCTION_STATES: Array<Array<ReadonlyArray<ReductionState>>> = new Array(db[db.length - 1].sum + 1);
db.forEach(sumReductions => {
    ALL_REDUCTION_STATES[sumReductions.sum] = sumReductions.combos.map(comboReductions => {
        const comboNumsSet = SudokuNumsSet.of(...comboReductions.combo);
        const reductionStates = new Array<ReductionState>(16).fill(INVALID_REDUCTION_STATE);
        for (const entry of comboReductions.entries) {
            if (entry.actions) {
                const cellM1DeletedNums = SudokuNumsSet.of(...entry.actions.deleteNums[0]);
                const cellM2DeletedNums = SudokuNumsSet.of(...entry.actions.deleteNums[1]);
                reductionStates[entry.state] = {
                    isValid: true,
                    comboNumsBits: comboNumsSet.bitStore,
                    deleteNumsInCell1Bits: cellM1DeletedNums.bitStore,
                    deleteNumsInCell2Bits: cellM2DeletedNums.bitStore,
                    keepNumsInCell1Bits: ~cellM1DeletedNums.bitStore,
                    keepNumsInCell2Bits: ~cellM2DeletedNums.bitStore
                };
            } else {
                reductionStates[entry.state] = EMPTY_REDUCTION_STATE;
            }
        }
        return reductionStates;
    });
});

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModel2DbReducer implements CageModelReducer {

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

    private readonly _referenceReductionStates: ReadonlyArray<ReadonlyArray<ReductionState>>;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._cellM1 = cageM.cellMs[0];
        this._cellM2 = cageM.cellMs[1];
        this._referenceReductionStates = ALL_REDUCTION_STATES[this._cageM.cage.sum];
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        //
        // [PERFORMANCE] Storing possible numbers for both `CellModel`s as bit masks
        // for efficient low-level number check and manipulation.
        //
        const cellM1NumsBits = this._cellM1._numOptsSet.bitStore;
        const cellM2NumsBits = this._cellM2._numOptsSet.bitStore;

        let actualReductionStateCellM1 = 0;
        let actualReductionStateCellM2 = 0;

        // Storing `CageModel`'s `ComboSet` to reference the object once.
        const combosSet = this._cageM.comboSet;

        // Iterating over each possible `Combo` (there are up to 4 `Combo`s for a `Cage` with 2 `Cell`s) ...
        for (const combo of combosSet.combos) {
            //
            // [PERFORMANCE]
            //
            // The following code achieves high performance
            // by determining and running a particular pre-coded denormalized reducing function
            // with hardcoded actions relevant to the current `Combo` numbers in the `CellModel`s.
            //
            // Overall, there are 16 distinct permutations of _numbers' presence_ states
            // for a particular `Combo` of a `CageModel` of a `Cage` with 2 `Cell`s.
            //
            // Each number in each `Cell` can be either absent (`0`) or present (`1`).
            // Overall, there are 2 numbers and 2 `Cell`s, which results in 4 state bits.
            // So, the amount of permutations is `2 ^ 4 = 16`.
            //
            // CPU-wise, performance is `O(1)` as it does *not* depend on the permutation count.
            // 16 pre-coded reducing functions absorb inherent `O(2 ^ N)` complexity.
            //
            // See also `DENORMALIZED_TACTICAL_REDUCERS`.
            //

            // [PERFORMANCE] Storing `Combo`'s unique numbers to access the object once for each number.
            const num1 = combo.number1;
            const num2 = combo.number2;

            const comboIndex = combo.index;

            //
            // [PERFORMANCE]
            //
            // Determining the index of the pre-coded reducing function
            // by forming the 4-bit state in the range `[0, 15]`
            // out of the current `Combo` numbers in `CellModel`s
            // by applying efficient bitwise AND and shift operators:
            //
            //  - The first bit is set if the first `Combo` number is possible in `CellModel` 1.
            //  - The second bit is set if the second `Combo` number is possible in `CellModel` 1.
            //  - The third bit is set if the first `Combo` number is possible in `CellModel` 2.
            //  - The fourth bit is set if the second `Combo` number is possible in `CellModel` 2.
            //
            // *Example 1*
            //
            // For the `Combo` of numbers `[5, 6]`,
            // if the first `CellModel` has the possible number option `5` but not `6`
            // and the second `CellModel` has both `5` and `6`,
            // the state will be as follows:
            //
            // ```
            // `CellModel` 1 numbers: `[..., 5, (no 6) ...]`
            // Compressed state for the presence of `Combo` numbers within `CellModel` 1: `0b01`
            // (the present first number `5` sets the first bit,
            // and the absent second number `6` clears the second bit)
            //
            // `CellModel` 2 numbers: `[..., 5, 6, ...]`
            // Compressed state for the presence of `Combo` numbers within `CellModel` 2: `0b11`
            // (both present numbers `5` and `6` set both bits)
            //
            // Compound state: `0b1101`
            // (shift to the right happens for the compressed state for `CellModel` 2
            // to form the joint 4-bit integer)
            // ```
            //
            // *Example 2*
            //
            // For the `Combo` of numbers `[5, 6]`,
            // if the first `CellModel` has the possible number option `6`
            // and the second `CellModel` does *not* have either `5` or `6`,
            // the state will be as follows:
            //
            // ```
            // `CellModel` 1 numbers: `[..., 6, (no 5) ...]`
            // Compressed state for the presence of `Combo` numbers within `CellModel` 1: `0b10`
            // (the absent first number `5` clears the first bit,
            // and the present second number `6` sets the second bit)
            //
            // `CellModel` 2 numbers: `[..., (no 5, no 6), ...]`
            // Compressed state for the presence of `Combo` numbers within `CellModel` 2: `0b00`
            // (having both `5` and `6` absent clears both bits)
            //
            // Compound state: `0b0010`
            // (shift to the right happens for the compressed state for `CellModel` 2
            // to form the joint 4-bit integer)
            // ```
            //
            // See also `DENORMALIZED_TACTICAL_REDUCERS`.
            //
            const compressedNumbersPresenceState =
                    ((cellM1NumsBits & (1 << num1)) >> num1) |         // The first bit is set if the first `Combo` number is possible in `CellModel` 1.
                    ((cellM1NumsBits & (1 << num2)) >> (num2 - 1)) |   // The second bit is set if the second `Combo` number is possible in `CellModel` 1.
                    (
                        ((cellM2NumsBits & (1 << num1)) >> num1) |     // The third bit is set if the first `Combo` number is possible in `CellModel` 2.
                        ((cellM2NumsBits & (1 << num2)) >> (num2 - 1)) // The fourth bit is set if the second `Combo` number is possible in `CellModel` 2.
                    ) << 2;

            //
            // [PERFORMANCE]
            //
            // Running a determined pre-coded denormalized reducing function
            // with hardcoded actions relevant to the current `Combo` numbers in the `CellModel`s.
            //
            // See `DENORMALIZED_TACTICAL_REDUCERS`.
            //
            // DENORMALIZED_TACTICAL_REDUCERS[compressedNumbersPresenceState](
            //         reduction, this._cageM, combosSet, combo,
            //         this._cellM1, this._cellM2,
            //         num1, num2
            // );

            const reductionState = this._referenceReductionStates[comboIndex][compressedNumbersPresenceState];

            if (reductionState.isValid) {
                actualReductionStateCellM1 |= (cellM1NumsBits & combo.numsBits & reductionState.keepNumsInCell1Bits);
                actualReductionStateCellM2 |= (cellM2NumsBits & combo.numsBits & reductionState.keepNumsInCell2Bits);
            } else {
                this._cageM.comboSet.deleteCombo(combo);
            }
        }

        reduction.tryReduceNumOpts(this._cellM1, new SudokuNumsSet(actualReductionStateCellM1), this._cageM);
        reduction.tryReduceNumOpts(this._cellM2, new SudokuNumsSet(actualReductionStateCellM2), this._cageM);
    }

}
