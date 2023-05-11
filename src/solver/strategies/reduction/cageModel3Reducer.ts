// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CombosSet, ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CageModel3ReductionDb, ComboReductionState, ComboReductionStatesByComboByPNS } from './db/cageModel3ReductionDb';
import { MasterModelReduction } from './masterModelReduction';

/**
 * High-performance implementation of reducer of possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
 *
 * Checks the validity of numbers given possible {@link Combo}s for the {@link CageModel}
 * using pre-computed {@link CageModel3ReductionDb}.
 *
 * @public
 */
export class CageModel3Reducer implements CageModelReducer {

    /**
     * {@link CageModel} to reduce.
     */
    private readonly _cageM: CageModel;

    /**
     * Cache for the {@link CageModel}'s {@link CombosSet}.
     */
    private readonly _combosSet: CombosSet;

    /**
     * Cache for the first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM1: CellModel;

    /**
     * Cache for {@link SudokuNumsSet} of possible numbers
     * for the first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM1NumsSet: ReadonlySudokuNumsSet;

    /**
     * Cache for the second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM2: CellModel;

    /**
     * Cache for {@link SudokuNumsSet} of possible numbers
     * for the second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM2NumsSet: ReadonlySudokuNumsSet;

    /**
     * Cache for the third {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM3: CellModel;

    /**
     * Cache for {@link SudokuNumsSet} of possible numbers
     * for the third {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM3NumsSet: ReadonlySudokuNumsSet;

    /**
     * Cache for {@link ComboReductionState}s of the {@link CageModel}'s {@link Cage} sum.
     */
    private readonly _combosReductionStates: ComboReductionStatesByComboByPNS;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
     *
     * @param cageM — {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;

        //
        // [PERFORMANCE]
        //
        // Caching references for faster access in the `reduce` method.
        // These references do *not* change across the `CageModel`'s lifetime.
        //
        this._combosSet = cageM.comboSet;
        this._cellM1 = cageM.cellMs[0];
        this._cellM1NumsSet = this._cellM1._numOptsSet;
        this._cellM2 = cageM.cellMs[1];
        this._cellM2NumsSet = this._cellM2._numOptsSet;
        this._cellM3 = cageM.cellMs[2];
        this._cellM3NumsSet = this._cellM3._numOptsSet;
        this._combosReductionStates = CageModel3ReductionDb.STATES[cageM.cage.sum];
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        //
        // The reduction works as follows:
        //
        //  - All _currently possible_ `CellModel`s' numbers
        //    set the immutable pre-reduction state in `currentCellM*NumsBits`.
        //  - All _updated possible_ `CellModel`s' numbers
        //    set the mutable post-reduction state in `updatedCellM*NumsBits`
        //    initially holding *no* numbers for all `CellModel`s.
        //    The following algorithm steps will update it
        //    with the still possible numbers for each `CellModel`.
        //  - For each `Combo` the `CageModel` considers as _currently possible_:
        //      - The logic checks whether `CellModel`s can accommodate
        //        such a `Combo` according to their _currently possible_ numbers:
        //          - If not, such a `Combo` is deleted from the list of currently possible `Combo`s.
        //          - If yes, such a `Combo` remains _currently possible_.
        //            `updatedCellM*NumsBits` accumulate _updated possible_ numbers for each `CellModel`.
        //            Pre-calculated reduction states define the _updated possible_ numbers
        //            according to the _currently possible_ `currentCellM*NumsBits`.
        //  - After all `Combo`s are checked, the _updated possible_ `updatedCellM*NumsBits`
        //    are set as the new _currently possible_ `currentCellM*NumsBits`.
        //  - The _updated possible_ `updatedCellM*NumsBits` are set as the new _currently possible_
        //    `CellModel`s' numbers.
        //

        // Storing currently possible `CellModel`s' numbers as bit masks (pre-reduction).
        const currentCellM1NumsBits = this._cellM1NumsSet.bits;
        const currentCellM2NumsBits = this._cellM2NumsSet.bits;
        const currentCellM3NumsBits = this._cellM3NumsSet.bits;

        // Initializing bit masks for the _updated possible_ `CellModel`s' numbers (post-reduction).
        let updatedCellM1NumsBits = 0;
        let updatedCellM2NumsBits = 0;
        let updatedCellM3NumsBits = 0;

        // Iterating over each _possible_ `Combo` (there are up to 8 `Combo`s for a `Cage` with 3 `Cell`s) ...
        for (const currentCombo of this._combosSet.combos) {

            //
            // Determining `ComboReductionState` for the _currently possible_ `Combo` numbers in the `CellModel`s
            // through the `CageModel3ReductionDb` cache using bitwise arithmetic and just a few array access operations.
            //
            const reductionState = CageModel3Reducer.getReductionState(currentCombo, currentCellM1NumsBits, currentCellM2NumsBits, currentCellM3NumsBits);

            //
            // If the `ComboReductionState` is valid,
            // then `Combo` is still relevant, and updated numbers for `CellModel`s
            // should include the numbers kept post-reduction for this `ComboReductionState`.
            // Otherwise, delete the `Combo`.
            //
            if (reductionState.isValid) {
                updatedCellM1NumsBits |= reductionState.keepCell1NumsBits;
                updatedCellM2NumsBits |= reductionState.keepCell2NumsBits;
                updatedCellM3NumsBits |= reductionState.keepCell3NumsBits;
            } else {
                this._combosSet.deleteCombo(currentCombo);
            }
        }

        // Reflecting _updated possible_ numbers for all `CellModel`s in the `MasterModelReduction`.
        reduction.tryReduceNumOptsBits(this._cellM1, updatedCellM1NumsBits, this._cageM);
        reduction.tryReduceNumOptsBits(this._cellM2, updatedCellM2NumsBits, this._cageM);
        reduction.tryReduceNumOptsBits(this._cellM3, updatedCellM3NumsBits, this._cageM);
    }

    static getReductionState(combo: Combo, cellM1NumsBits: number, cellM2NumsBits: number, cellM3NumsBits: number) {
        // [PERFORMANCE] Storing `Combo`'s unique numbers to access the object once for each number.
        const num1 = combo.number1;
        const num2 = combo.number2;
        const num3 = combo.number3;

        //
        // [PERFORMANCE]
        //
        // Determining the _present numbers state_ (or PNS)
        // by forming the 9-bit state in the range `[0, 511]`
        // out of the current `Combo` numbers in `CellModel`s
        // by applying efficient bitwise AND and shift operators:
        //
        //  - The first bit is set if the first `Combo` number is possible in the first `CellModel`.
        //  - The second bit is set if the second `Combo` number is possible in the first `CellModel`.
        //  - The third bit is set if the third `Combo` number is possible in the first `CellModel`.
        //  - The fourth bit is set if the first `Combo` number is possible in the second `CellModel`.
        //  - The fifth bit is set if the second `Combo` number is possible in the second `CellModel`.
        //  - The sixth bit is set if the third `Combo` number is possible in the second `CellModel`.
        //  - The seventh bit is set if the first `Combo` number is possible in the third `CellModel`.
        //  - The eighth bit is set if the second `Combo` number is possible in the third `CellModel`.
        //  - The ninth bit is set if the third `Combo` number is possible in the third `CellModel`.
        //
        // *Example*
        //
        // For the `Combo` of numbers `[5, 6, 7]`,
        // if the first `CellModel` has the possible numbers `5` and `7` but not `6`,
        // the second `CellModel` has all numbers (`5`, `6`, and `7`),
        // and the third `CellModel` has only `6`,
        // the state will be as follows:
        //
        // ```
        // `CellModel` 1 numbers: `[..., 5, (no 6), 7 ...]`
        // State of `Combo` present numbers within the first `CellModel`: `0b101`
        // (the present first number `5` sets the first bit,
        // the missing second number `6` clears the second bit,
        // and the present third number `7` sets the third bit).
        //
        // `CellModel` 2 numbers: `[..., 5, 6, 7, ...]`
        // State of `Combo` present numbers within the second `CellModel`: `0b111`
        // (present numbers `5`, `6`, and `7` set first, second, and third bits).
        //
        // `CellModel` 3 numbers: `[..., (no 5), 6, (no 7) ...]`
        // State of `Combo` present numbers within the first `CellModel`: `0b010`
        // (the missing first number `5` clears the first bit,
        // the present second number `6` sets the second bit,
        // the missing third number `7` clears the third bit).
        //
        // Compound state: `0b010111101`
        // (shift to the right happens for the present numbers state for the second and third `CellModel`s
        // to form the joint 9-bit integer).
        // ```
        //
        const presentNumbersState =
                // The first bit is set if the first `Combo` number is possible in the first `CellModel`.
                ((cellM1NumsBits & (1 << num1)) >> num1) |
                // The second bit is set if the second `Combo` number is possible in the first `CellModel`.
                ((cellM1NumsBits & (1 << num2)) >> (num2 - 1)) |
                // The third bit is set if the third `Combo` number is possible in the first `CellModel`.
                ((cellM1NumsBits & (1 << num3)) >> (num3 - 2)) |
                (
                    // The fourth bit is set if the first `Combo` number is possible in the second `CellModel`.
                    ((cellM2NumsBits & (1 << num1)) >> num1) |
                    // The fifth bit is set if the second `Combo` number is possible in the second `CellModel`.
                    ((cellM2NumsBits & (1 << num2)) >> (num2 - 1)) |
                    // The sixth bit is set if the third `Combo` number is possible in the second `CellModel`.
                    ((cellM2NumsBits & (1 << num3)) >> (num3 - 2))
                ) << 3 |
                (
                    // The seventh bit is set if the first `Combo` number is possible in the third `CellModel`.
                    ((cellM3NumsBits & (1 << num1)) >> num1) |
                    // The eighth bit is set if the second `Combo` number is possible in the third `CellModel`.
                    ((cellM3NumsBits & (1 << num2)) >> (num2 - 1)) |
                    // The ninth bit is set if the third `Combo` number is possible in the third `CellModel`.
                    ((cellM3NumsBits & (1 << num3)) >> (num3 - 2))
                ) << 6;

        //
        // [PERFORMANCE]
        //
        // Determining `ComboReductionState` relevant to the `Combo` numbers present in the `CellModel`s
        // through the `CageModel3ReductionDb` cache using only two array access operations.
        //
        return CageModel3ReductionDb.STATES[combo.sum][combo.index][presentNumbersState];
    }

}
