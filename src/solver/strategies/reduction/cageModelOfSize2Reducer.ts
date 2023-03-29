import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { NumsReduction } from './numsReduction';

export class CageModelOfSize2Reducer {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * Reduces possible numbers for {@link CellModel}s
     * within a {@link Cage} of 2 {@link Cell}s in a performant way
     * by checking the validity of numbers' option given possible {@link Combo}s for {@link CageModel}.
     *
     * @param reduction - {@link NumsReduction} that tracks deleted number options.
     */
    static reduce(cellM0: CellModel, cellM1: CellModel, cageMCombos: CombosSet, reduction: NumsReduction): void {
        //
        // [PERFORMANCE] This implementation uses the following techniques to do fast work:
        //
        //  - All underlying data structures use bit manipulation for efficiency.
        //  - Access all relevant data just once:
        //  `CellModel`s, `Combo` numbers, check for the presence of numbers in `CellModel`s, and others.
        //  - Short-circuit in conditions if there is nothing to do.
        //  - Hierarchical-dependent conditions eliminate the need for double-checks.
        //
        // The code could be more concise, and it has more lengthiness on purpose.
        // Again, for performance reasons.
        //

        // Iterating over each registered `Combo` (there are up to 4 `Combo`s for a `Cage` with 2 `Cell`s) ...
        for (const combo of cageMCombos.combos) {

            //
            // Storing `Combo`'s unique numbers to access the object once for each number.
            //
            // Follow-up examples in the implementation comments assume `Combo` of numbers `[5, 6]`.
            //
            const num0 = combo.number0;
            const num1 = combo.number1;

            // Checking the presence of each `Combo` number for each `CellModel` just once.
            const cell0HasNum0 = cellM0.hasNumOpt(num0);
            const cell0HasNum1 = cellM0.hasNumOpt(num1);
            const cell1HasNum0 = cellM1.hasNumOpt(num0);
            const cell1HasNum1 = cellM1.hasNumOpt(num1);

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
            if (cell0HasNum0 && cell0HasNum1 && cell1HasNum0 && cell1HasNum1) continue;

            // Checking the first `CellModel` for the presence of the first `Combo` number.
            if (!cell0HasNum0) {
                if (!cell1HasNum0) {
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
                    if (cell0HasNum1) reduction.deleteNumOpt(cellM0, num1);
                    if (cell1HasNum1) reduction.deleteNumOpt(cellM1, num1);
                    cageMCombos.deleteCombo(combo);
                } else if (cell1HasNum1) {
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
                    reduction.deleteNumOpt(cellM1, num1);
                }
            } else if (!cell1HasNum1) {
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
                reduction.deleteNumOpt(cellM0, num0);
            }

            // Checking the first `CellModel` for the presence of the second `Combo` number.
            if (!cell0HasNum1) {
                if (!cell1HasNum1) {
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
                    if (cell0HasNum0) reduction.deleteNumOpt(cellM0, num0);
                    if (cell1HasNum0) reduction.deleteNumOpt(cellM1, num0);
                    cageMCombos.deleteCombo(combo);
                } else if (cell1HasNum0) {
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
                    reduction.deleteNumOpt(cellM1, num0);
                }
            } else if (!cell1HasNum0) {
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
                reduction.deleteNumOpt(cellM0, num1);
            }
        }
    }

}