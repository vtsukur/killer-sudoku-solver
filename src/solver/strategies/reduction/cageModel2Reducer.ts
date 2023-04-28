// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet, ReadonlySudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

/**
 * Type alias for pre-coded _inline reduction_ function
 * with hardcoded actions relevant to the presence of specific `Combo` numbers in the `CellModel`s.
 */
type InlineTacticalReducer = (
        reduction: MasterModelReduction,
        cageM: CageModel,
        combosSet: CombosSet,
        combo: Combo,
        cellM1: CellModel,
        cellM2: CellModel,
        num1: number,
        num2: number
    ) => void;

/**
 * High-performance implementation of reducer of possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s.
 *
 * Checks the validity of numbers given possible {@link Combo}s for the {@link CageModel}
 * and executes fast _inline reduction_ function according to the _present numbers_ state.
 *
 * @public
 */
export class CageModel2Reducer implements CageModelReducer {

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
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        //
        // [PERFORMANCE] Storing possible numbers for both `CellModel`s as bit masks
        // for efficient low-level check and manipulation of possible numbers.
        //
        const cellM1NumsBits = this._cellM1NumsSet.bits;
        const cellM2NumsBits = this._cellM2NumsSet.bits;

        // Iterating over each possible `Combo` (there are up to 4 `Combo`s for a `Cage` with 2 `Cell`s) ...
        for (const combo of this._combosSet.combos) {
            //
            // [PERFORMANCE]
            //
            // The following code achieves high performance
            // by determining and running a particular pre-coded _inline reduction_ function
            // with hardcoded actions relevant to the current `Combo` numbers in the `CellModel`s.
            //
            // Overall, there are 16 distinct permutations of _present numbers_ states
            // for a particular `Combo` of a `CageModel` of a `Cage` with 2 `Cell`s.
            //
            // Each number in each `Cell` can be either absent (`0`) or present (`1`).
            // Overall, there are 2 numbers and 2 `Cell`s, which results in 4 state bits.
            // So, the amount of permutations is `2 ^ 4 = 16`.
            //
            // CPU-wise, performance is `O(1)` as it does *not* depend on the permutation count.
            // 16 pre-coded reducing functions absorb inherent `O(2 ^ N)` complexity.
            //
            // See also `INLINE_TACTICAL_REDUCERS`.
            //

            // [PERFORMANCE] Storing `Combo`'s unique numbers to access the object once for each number.
            const num1 = combo.number1;
            const num2 = combo.number2;

            //
            // [PERFORMANCE]
            //
            // Determining the index of the pre-coded _inline reduction_ function
            // by forming the 4-bit state in the range `[0, 15]`
            // out of the current `Combo` numbers in `CellModel`s
            // by applying efficient bitwise AND and shift operators:
            //
            //  - The first bit is set if the first `Combo` number is possible in the first `CellModel`.
            //  - The second bit is set if the second `Combo` number is possible in the first `CellModel`.
            //  - The third bit is set if the first `Combo` number is possible in the second `CellModel`.
            //  - The fourth bit is set if the second `Combo` number is possible in the second `CellModel`.
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
            // State of `Combo` present numbers within the first `CellModel`: `0b01`
            // (the present first number `5` sets the first bit,
            // and the absent second number `6` clears the second bit)
            //
            // `CellModel` 2 numbers: `[..., 5, 6, ...]`
            // State of `Combo` present numbers within the second `CellModel`: `0b11`
            // (both present numbers `5` and `6` set both first and second bits)
            //
            // Compound state: `0b1101`
            // (shift to the right happens for the present numbers state for the second `CellModel`
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
            // State of `Combo` present numbers within the first `CellModel`: `0b10`
            // (the absent first number `5` clears the first bit,
            // and the present second number `6` sets the second bit)
            //
            // `CellModel` 2 numbers: `[..., (no 5, no 6), ...]`
            // State of `Combo` present numbers within the second `CellModel`: `0b00`
            // (having both `5` and `6` absent clears both bits)
            //
            // Compound state: `0b0010`
            // (shift to the right happens for the present numbers state for the second `CellModel`
            // to form the joint 4-bit integer)
            // ```
            //
            const presentNumbersState =
                    ((cellM1NumsBits & (1 << num1)) >> num1) |         // The first bit is set if the first `Combo` number is possible in `CellModel` 1.
                    ((cellM1NumsBits & (1 << num2)) >> (num2 - 1)) |   // The second bit is set if the second `Combo` number is possible in `CellModel` 1.
                    (
                        ((cellM2NumsBits & (1 << num1)) >> num1) |     // The third bit is set if the first `Combo` number is possible in `CellModel` 2.
                        ((cellM2NumsBits & (1 << num2)) >> (num2 - 1)) // The fourth bit is set if the second `Combo` number is possible in `CellModel` 2.
                    ) << 2;

            //
            // [PERFORMANCE]
            //
            // Running a determined pre-coded _inline reduction_ function
            // with hardcoded actions relevant to the current `Combo` numbers in the `CellModel`s.
            //
            INLINE_TACTICAL_REDUCERS[presentNumbersState](
                    reduction, this._cageM, this._combosSet, combo,
                    this._cellM1, this._cellM2,
                    num1, num2
            );
        }
    }

}

/**
 * Readonly array of 16 pre-coded _inline reduction_ functions
 * with hardcoded actions relevant to the presence of specific `Combo` numbers in the `CellModel`s.
 *
 * _Inline reduction_ functions are indexed by a 4-bit state
 * representing the presence of `Combo` numbers within `CellModel`s:
 *
 *  - The first bit is set if the first `Combo` number is possible in the first CellModel`.
 *  - The second bit is set if the second `Combo` number is possible in the first `CellModel`.
 *  - The third bit is set if the first `Combo` number is possible in the second `CellModel`.
 *  - The fourth bit is set if the second `Combo` number is possible in the second `CellModel`.
 *
 * Full table of cases for the `Combo` of `[num1, num2]`:
 *
 * | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | Input                                                                                 | Reducing Actions                                                      | Output                                                      |
 * | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | _Present Numbers_ State | `CellModel` 2 - `Combo` Nums | `CellModel` 1 - `Combo` Nums | For `CellModel` 2        | For `CellModel` 1        | Delete `Combo`? | `CellModel` 2 - `Combo` Nums | `CellModel` 1 - `Combo` Nums |
 * | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | 0b0000 =  0             | <none>                       | <none>                       | <none>                   | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b0001 =  1             | <none>                       | `num1`                       | <none>                   | delete `num1`            | yes             | <none>                       | <none>                       |
 * | 0b0010 =  2             | <none>                       | `num2`                       | <none>                   | delete `num2`            | yes             | <none>                       | <none>                       |
 * | 0b0011 =  3             | <none>                       | `num1`, `num2`               | <none>                   | delete `num1` and `num2` | yes             | <none>                       | <none>                       |
 * | 0b0100 =  4             | `num1`                       | <none>                       | delete `num1`            | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b0101 =  5             | `num1`                       | `num1`                       | delete `num1`            | delete `num1`            | yes             | <none>                       | <none>                       |
 * | 0b0110 =  6             | `num1`                       | `num2`                       | <none>                   | <none>                   | no              | `num1`                       | `num2`                       |
 * | 0b0111 =  7             | `num1`                       | `num1`, `num2`               | <none>                   | delete `num1`            | no              | `num1`                       | `num2`                       |
 * | 0b1000 =  8             | `num2`                       | <none>                       | delete `num2`            | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b1001 =  9             | `num2`                       | `num1`                       | <none>                   | <none>                   | no              | `num2`                       | `num1`                       |
 * | 0b1010 = 10             | `num2`                       | `num2`                       | delete `num2`            | delete `num2`            | yes             | <none>                       | <none>                       |
 * | 0b1011 = 11             | `num2`                       | `num1`, `num2`               | <none>                   | delete `num2`            | no              | `num2`                       | `num1`                       |
 * | 0b1100 = 12             | `num1`, `num2`               | <none>                       | delete `num1` and `num2` | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b1101 = 13             | `num1`, `num2`               | `num1`                       | delete `num1`            | <none>                   | no              | `num2`                       | `num1`                       |
 * | 0b1110 = 14             | `num1`, `num2`               | `num2`                       | delete `num2`            | <none>                   | no              | `num1`                       | `num2`                       |
 * | 0b1111 = 15             | `num1`, `num2`               | `num1`, `num2`               | <none>                   | <none>                   | no              | `num1`, `num2`               | `num1`, `num2`               |
 * | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 */
const INLINE_TACTICAL_REDUCERS: ReadonlyArray<InlineTacticalReducer> = [
    // Element index is the _present numbers_ state: `0b00_00 = 0`
    (_reduction, _cageM, combosSet, combo) => {
        combosSet.deleteCombo(combo);
    },
    // Element index is the _present numbers_ state: `0b00_01 = 1`
    (reduction, cageM, combosSet, combo, cellM1, _cellM2, num1) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    // Element index is the _present numbers_ state: `0b00_10 = 2`
    (reduction, cageM, combosSet, combo, cellM1, _cellM2, _num1, num2) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num2, cageM);
    },
    // Element index is the _present numbers_ state: `0b00_11 = 3`
    (reduction, cageM, combosSet, combo, cellM1) => {
        combosSet.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM1, combo, cageM);
    },
    // Element index is the _present numbers_ state: `0b01_00 = 4`
    (reduction, cageM, combosSet, combo, _cellM1, cellM2, num1) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM2, num1, cageM);
    },
    // Element index is the _present numbers_ state: `0b01_01 = 5`
    (reduction, cageM, combosSet, combo, cellM1, cellM2, num1) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num1, cageM);
        reduction.deleteNumOpt(cellM2, num1, cageM);
    },
    // Element index is the _present numbers_ state: `0b01_10 = 6`
    NOTHING_TO_REDUCE,
    // Element index is the _present numbers_ state: `0b01_11 = 7`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, num1) => {
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    // Element index is the _present numbers_ state: `0b10_00 = 8`
    (reduction, cageM, combosSet, combo, _cellM1, cellM2, _num1, num2) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM2, num2, cageM);
    },
    // Element index is the _present numbers_ state: `0b10_01 = 9`
    NOTHING_TO_REDUCE,
    // Element index is the _present numbers_ state: `0b10_10 = 10`
    (reduction, cageM, combosSet, combo, cellM1, cellM2, _num1, num2) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num2, cageM);
        reduction.deleteNumOpt(cellM2, num2, cageM);
    },
    // Element index is the _present numbers_ state: `0b10_11 = 11`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, _num1, num2) => {
        reduction.deleteNumOpt(cellM1, num2, cageM);
    },
    // Element index is the _present numbers_ state: `0b11_00 = 12`
    (reduction, cageM, combosSet, combo, _cellM1, cellM2) => {
        combosSet.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM2, combo, cageM);
    },
    // Element index is the _present numbers_ state: `0b11_01 = 13`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, num1) => {
        reduction.deleteNumOpt(cellM2, num1, cageM);
    },
    // Element index is the _present numbers_ state: `0b11_10 = 14`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, _num1, num2) => {
        reduction.deleteNumOpt(cellM2, num2, cageM);
    },
    // Element index is the _present numbers_ state: `0b11_11 = 15`
    NOTHING_TO_REDUCE
];

/**
 * Empty reduction function.
 */
function NOTHING_TO_REDUCE() {
    // No-op.
}
