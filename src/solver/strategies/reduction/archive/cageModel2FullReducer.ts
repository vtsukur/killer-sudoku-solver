import { CageModel } from '../../../models/elements/cageModel';
import { CellModel } from '../../../models/elements/cellModel';
import { CombosSet, ReadonlySudokuNumsSet } from '../../../sets';
import { CageModelReducer } from '../cageModelReducer';
import { MasterModelReduction } from '../masterModelReduction';

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s
 * by checking the validity of numbers given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModel2FullReducer implements CageModelReducer {

    /**
     * {@link CageModel} to reduce.
     */
    private readonly _cageM: CageModel;

    /**
     * Cached reference for the {@link CageModel}'s {@link CombosSet}.
     */
    private readonly _combosSet: CombosSet;

    /**
     * Cached reference for the first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM1: CellModel;

    /**
     * Cached reference for the {@link SudokuNumsSet} of possible numbers
     * for the first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM1NumsSet: ReadonlySudokuNumsSet;

    /**
     * Cached reference for the second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM2: CellModel;

    /**
     * Cached reference for the {@link SudokuNumsSet} of possible numbers
     * for the second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM2NumsSet: ReadonlySudokuNumsSet;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;

        //
        // [PERFORMANCE]
        //
        // Caching references for faster access in the `reduce` method.
        // These references do *not* change across the `CageModel`s lifetime.
        //
        this._combosSet = cageM.combosSet;
        this._cellM1 = cageM.cellMs[0];
        this._cellM1NumsSet = this._cellM1._numOptsSet;
        this._cellM2 = cageM.cellMs[1];
        this._cellM2NumsSet = this._cellM2._numOptsSet;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        //
        // [PERFORMANCE] This implementation uses the following techniques to do fast work:
        //
        //  - All underlying data structures use bit manipulation for efficiency.
        //  - Accessing all relevant data just once:
        //  `CellModel`s, `Combo` numbers, check for the presence of numbers in `CellModel`s, and others.
        //  - Short-circuit in conditions if there is nothing to do.
        //  - Hierarchical-dependent conditions eliminate the need for double-checks.
        //
        // The code could be more concise, and it has more lengthiness on purpose.
        // Again, for performance reasons.
        //

        //
        // [PERFORMANCE] Storing possible numbers for both `CellModel`s as bit masks
        // for efficient low-level check and manipulation of possible numbers.
        //
        const cellM1NumsBits = this._cellM1NumsSet.bits;
        const cellM2NumsBits = this._cellM2NumsSet.bits;

        // Iterating over each registered `Combo` (there are up to 4 `Combo`s for a `Cage` with 2 `Cell`s) ...
        for (const combo of this._combosSet.combos) {

            //
            // Storing `Combo`'s unique numbers to access the object once for each number.
            //
            // Follow-up examples in the implementation comments assume `Combo` of numbers `[5, 6]`.
            //
            const num1 = combo.number1;
            const num2 = combo.number2;

            // Checking the presence of each `Combo` number for each `CellModel` just once.
            const cell1HasNum1 = cellM1NumsBits & (1 << num1);
            const cell1HasNum2 = cellM1NumsBits & (1 << num2);
            const cell2HasNum1 = cellM2NumsBits & (1 << num1);
            const cell2HasNum2 = cellM2NumsBits & (1 << num2);

            //
            // Proceeding to reduction if and only if
            // at least one `Combo` number is absent in at least one `CellModel`.
            // Otherwise, there is nothing to reduce for the current `Combo`.
            //
            // For example, for the `Combo` of numbers `[5, 6]`,
            // if both `CellModel`s have number options `5` and `6`,
            // there is nothing to reduce:
            //
            // ```
            // (before reduction)
            // CellModel 1: [..., 5, 6, ...]
            // CellModel 2: [..., 5, 6, ...]
            //
            // (after reduction: no changes)
            // CellModel 1: [..., 5, 6, ...]
            // CellModel 2: [..., 5, 6, ...]
            // ```
            //
            if (cell1HasNum1 && cell1HasNum2 && cell2HasNum1 && cell2HasNum2) continue;

            // Checking the first `CellModel` for the presence of the first `Combo` number.
            if (!cell1HasNum1) {
                if (!cell2HasNum1) {
                    //
                    // If both `CellModel`s do *not* have the first `Combo` number,
                    // then the complementing counterpart (second `Combo` number)
                    // should be removed from both `CellModel`s (if present)
                    // alongside the current `Combo`.
                    //
                    // For example, for the `Combo` of numbers `[5, 6]`,
                    // if both `CellModel`s do *not* have the number option `5`,
                    // then the number option `6` is removed for both `CellModel`s:
                    //
                    // ```
                    // (before reduction)
                    // CellModel 1: [..., 6, ...]
                    // CellModel 2: [..., 6, ...]
                    //
                    // (after reduction)
                    // CellModel 1: [... (no 6)]
                    // CellModel 2: [... (no 6)]
                    // ```
                    //
                    if (cell1HasNum2) reduction.deleteNumOpt(this._cellM1, num2, this._cageM);
                    if (cell2HasNum2) reduction.deleteNumOpt(this._cellM2, num2, this._cageM);
                    this._combosSet.deleteCombo(combo);
                } else if (cell2HasNum2) {
                    //
                    // If the first `CellModel` does *not* have the first `Combo` number
                    // and the second `CellModel` still has the complementing counterpart
                    // (the second `Combo` number),
                    // it means the second `Combo` number is no longer relevant
                    // and is thus subject to removal from the second `CellModel`.
                    //
                    // For example, for the `Combo` of numbers `[5, 6]`,
                    // if the first `CellModel` does *not* have the number option `5`,
                    // and the second `CellModel` still has the number option `6`,
                    // then the number option `6` is removed for the second `CellModel`.
                    //
                    // ```
                    // (before reduction)
                    // CellModel 1: [..., 6, ...]
                    // CellModel 2: [..., 5, 6, ...]
                    //
                    // (after reduction)
                    // CellModel 1: [..., 6, ...]
                    // CellModel 2: [..., 5, ... (no 6)]
                    // ```
                    //
                    reduction.deleteNumOpt(this._cellM2, num2, this._cageM);
                }
            } else if (!cell2HasNum2) {
                //
                // If the first `CellModel` still has the first `Combo` number
                // and the second `CellModel` does *not* have the complementing counterpart
                // (the second `Combo` number),
                // it means the first `Combo` number is no longer relevant
                // and is thus subject to removal from the first `CellModel`.
                //
                // For example, for the `Combo` of numbers `[5, 6]`,
                // if the first `CellModel` has the number option `5`,
                // and the second `CellModel` does *not* have the number option `6`,
                // then the number option `5` is removed for the first `CellModel`.
                //
                // ```
                // (before reduction)
                // CellModel 1: [..., 5, 6, ...]
                // CellModel 2: [..., 5, ...]
                //
                // (after reduction)
                // CellModel 1: [..., 6, ... (no 5)]
                // CellModel 2: [..., 5, ...]
                // ```
                //
                reduction.deleteNumOpt(this._cellM1, num1, this._cageM);
            }

            // Checking the first `CellModel` for the presence of the second `Combo` number.
            if (!cell1HasNum2) {
                if (!cell2HasNum2) {
                    //
                    // If both `CellModel`s do *not* have the second `Combo` number,
                    // then the complementing counterpart (the first `Combo` number)
                    // should be removed from both `CellModel`s (if present)
                    // alongside the current `Combo`.
                    //
                    // For example, for the `Combo` of numbers `[5, 6]`,
                    // if both `CellModel`s do *not* have the number option `6`,
                    // then the number option `5` is removed for both `CellModel`s.
                    //
                    // ```
                    // (before reduction)
                    // CellModel 1: [..., 5, ...]
                    // CellModel 2: [..., 5, ...]
                    //
                    // (after reduction)
                    // CellModel 1: [... (no 5)]
                    // CellModel 2: [... (no 5)]
                    // ```
                    //
                    if (cell1HasNum1) reduction.deleteNumOpt(this._cellM1, num1, this._cageM);
                    if (cell2HasNum1) reduction.deleteNumOpt(this._cellM2, num1, this._cageM);
                    this._combosSet.deleteCombo(combo);
                } else if (cell2HasNum1) {
                    //
                    // If the first `CellModel` does *not* have the second `Combo` number
                    // and the second `CellModel` still has the complementing counterpart
                    // (the first `Combo` number),
                    // it means the first `Combo` number is no longer relevant
                    // and is thus subject to removal from the second `CellModel`.
                    //
                    // For example, for the `Combo` of numbers `[5, 6]`,
                    // if the first `CellModel` does *not* have the number option `6`,
                    // and the second `CellModel` still has the number option `5`,
                    // then the number option `5` is removed for the second `CellModel`.
                    //
                    // ```
                    // (before reduction)
                    // CellModel 1: [..., 5, ...]
                    // CellModel 2: [..., 5, 6, ...]
                    //
                    // (after reduction)
                    // CellModel 1: [..., 5, ...]
                    // CellModel 2: [..., 6, ... (no 5)]
                    // ```
                    //
                    reduction.deleteNumOpt(this._cellM2, num1, this._cageM);

                    //
                    // Also, if the prior conditional logic of this function deleted
                    // the second `Combo` number from the second `CellModel`
                    // and now the first `Combo` number is also deleted from the second `CellModel`,
                    // the current `Combo` is no longer relevant and is thus subject to removal.
                    //
                    // For example, for the `Combo` of numbers `[5, 6]`,
                    // if the first `CellModel` does *not* have `5` nor `6` as the number options,
                    // and the second `CellModel` has both `5` and `6`,
                    // then the `Combo` is removed for both `CellModel`s.
                    //
                    // ```
                    // (before reduction)
                    // CellModel 1: [... (no 5 and no 6)]
                    // CellModel 2: [..., 5, 6 ...]
                    //
                    // (after reduction)
                    // CellModel 1: [... (no 5 and no 6)]
                    // CellModel 2: [... (no 5 and no 6)]
                    // ```
                    //
                    if (!this._cellM2.hasNumOpt(num2)) {
                        this._combosSet.deleteCombo(combo);
                    }
                }
            } else if (!cell2HasNum1) {
                //
                // If the first `CellModel` still has the second `Combo` number
                // and the second `CellModel` does *not* have the complementing counterpart
                // (the first `Combo` number),
                // it means the second `Combo` number is no longer relevant
                // and is thus subject to removal from the first `CellModel`.
                //
                // For example, for the `Combo` of numbers `[5, 6]`,
                // if the first `CellModel` has the number option `6`,
                // and the second `CellModel` does *not* have the number option `5`,
                // then the number option `6` is removed for the first `CellModel`.
                //
                // ```
                // (before reduction)
                // CellModel 1: [..., 5, 6, ...]
                // CellModel 2: [..., 6, ...]
                //
                // (after reduction)
                // CellModel 1: [..., 5, ... (no 6)]
                // CellModel 2: [..., 6, ...]
                // ```
                //
                reduction.deleteNumOpt(this._cellM1, num2, this._cageM);

                //
                // Also, if the prior conditional logic of this function deleted
                // the first `Combo` number from the first `CellModel`
                // and now the second `Combo` number is also deleted from the first `CellModel`,
                // the current `Combo` is no longer relevant and is thus subject to removal.
                //
                // For example, for the `Combo` of numbers `[5, 6]`,
                // if the first `CellModel` has both `5` and `6`,
                // and the second `CellModel` does *not* have `5` nor `6` as the number options,
                // then the `Combo` is removed for both `CellModel`s.
                //
                // ```
                // (before reduction)
                // CellModel 1: [..., 5, 6 ...]
                // CellModel 2: [... (no 5 and no 6)]
                //
                // (after reduction)
                // CellModel 1: [... (no 5 and no 6)]
                // CellModel 2: [... (no 5 and no 6)]
                // ```
                //
                if (!this._cellM1.hasNumOpt(num1)) {
                    this._combosSet.deleteCombo(combo);
                }
            }
        }
    }

}
