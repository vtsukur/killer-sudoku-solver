import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

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
        num1: number,
        num2: number
    ) => void;

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModel2Reducer implements CageModelReducer {

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
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._cellM1 = cageM.cellMs[0];
        this._cellM2 = cageM.cellMs[1];
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
            DENORMALIZED_TACTICAL_REDUCERS[compressedNumbersPresenceState](
                    reduction, this._cageM, combosSet, combo,
                    this._cellM1, this._cellM2,
                    num1, num2
            );
        }
    }

}

/**
 * Readonly array of 16 pre-coded denormalized reducing functions
 * with hardcoded actions relevant to the specific `Combo` numbers in the `CellModel`s.
 *
 * Denormalized reducing functions are indexed by a 4-bit compressed state
 * representing the presence of `Combo` numbers within `CellModel`s:
 *
 *  - The first bit is set if the first `Combo` number is possible in `CellModel` 1.
 *  - The second bit is set if the second `Combo` number is possible in `CellModel` 1.
 *  - The third bit is set if the first `Combo` number is possible in `CellModel` 2.
 *  - The fourth bit is set if the second `Combo` number is possible in `CellModel` 2.
 *
 * Full table of cases for the `Combo` of `[num1, num2]`:
 *
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | Input                                                                          | Reducing Actions                                                      | Output                                                      |
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | Compressed State | `CellModel` 2 - `Combo` Nums | `CellModel` 1 - `Combo` Nums | For `CellModel` 2        | For `CellModel` 1        | Delete `Combo`? | `CellModel` 2 - `Combo` Nums | `CellModel` 1 - `Combo` Nums |
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | 0b0000 =  0      | <none>                       | <none>                       | <none>                   | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b0001 =  1      | <none>                       | `num1`                       | <none>                   | delete `num1`            | yes             | <none>                       | <none>                       |
 * | 0b0010 =  2      | <none>                       | `num2`                       | <none>                   | delete `num2`            | yes             | <none>                       | <none>                       |
 * | 0b0011 =  3      | <none>                       | `num1`, `num2`               | <none>                   | delete `num1` and `num2` | yes             | <none>                       | <none>                       |
 * | 0b0100 =  4      | `num1`                       | <none>                       | delete `num1`            | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b0101 =  5      | `num1`                       | `num1`                       | delete `num1`            | delete `num1`            | yes             | <none>                       | <none>                       |
 * | 0b0110 =  6      | `num1`                       | `num2`                       | <none>                   | <none>                   | no              | `num1`                       | `num2`                       |
 * | 0b0111 =  7      | `num1`                       | `num1`, `num2`               | <none>                   | delete `num1`            | no              | `num1`                       | `num2`                       |
 * | 0b1000 =  8      | `num2`                       | <none>                       | delete `num2`            | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b1001 =  9      | `num2`                       | `num1`                       | <none>                   | <none>                   | no              | `num2`                       | `num1`                       |
 * | 0b1010 = 10      | `num2`                       | `num2`                       | delete `num2`            | delete `num2`            | yes             | <none>                       | <none>                       |
 * | 0b1011 = 11      | `num2`                       | `num1`, `num2`               | <none>                   | delete `num2`            | no              | `num2`                       | `num1`                       |
 * | 0b1100 = 12      | `num1`, `num2`               | <none>                       | delete `num1` and `num2` | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b1101 = 13      | `num1`, `num2`               | `num1`                       | delete `num1`            | <none>                   | no              | `num2`                       | `num1`                       |
 * | 0b1110 = 14      | `num1`, `num2`               | `num2`                       | delete `num2`            | <none>                   | no              | `num1`                       | `num2`                       |
 * | 0b1111 = 15      | `num1`, `num2`               | `num1`, `num2`               | <none>                   | <none>                   | no              | `num1`, `num2`               | `num1`, `num2`               |
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 */
const DENORMALIZED_TACTICAL_REDUCERS: ReadonlyArray<DenormalizedTacticalReducer> = [
    // `0b00_00 = 0`
    (_reduction, _cageM, combosSet, combo) => {
        combosSet.deleteCombo(combo);
    },
    // `0b00_01 = 1`
    (reduction, cageM, combosSet, combo, cellM1, _cellM2, num1) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    // `0b00_10 = 2`
    (reduction, cageM, combosSet, combo, cellM1, _cellM2, _num1, num2) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num2, cageM);
    },
    // `0b00_11 = 3`
    (reduction, cageM, combosSet, combo, cellM1) => {
        combosSet.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM1, combo, cageM);
    },
    // `0b01_00 = 4`
    (reduction, cageM, combosSet, combo, _cellM1, cellM2, num1) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM2, num1, cageM);
    },
    // `0b01_01 = 5`
    (reduction, cageM, combosSet, combo, cellM1, cellM2, num1) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num1, cageM);
        reduction.deleteNumOpt(cellM2, num1, cageM);
    },
    // `0b01_10 = 6`
    NOTHING_TO_REDUCE,
    // `0b01_11 = 7`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, num1) => {
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    // `0b10_00 = 8`
    (reduction, cageM, combosSet, combo, _cellM1, cellM2, _num1, num2) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM2, num2, cageM);
    },
    // `0b10_01 = 9`
    NOTHING_TO_REDUCE,
    // `0b10_10 = 10`
    (reduction, cageM, combosSet, combo, cellM1, cellM2, _num1, num2) => {
        combosSet.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num2, cageM);
        reduction.deleteNumOpt(cellM2, num2, cageM);
    },
    // `0b10_11 = 11`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, _num1, num2) => {
        reduction.deleteNumOpt(cellM1, num2, cageM);
    },
    // `0b11_00 = 12`
    (reduction, cageM, combosSet, combo, _cellM1, cellM2) => {
        combosSet.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM2, combo, cageM);
    },
    // `0b11_01 = 13`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, num1) => {
        reduction.deleteNumOpt(cellM2, num1, cageM);
    },
    // `0b11_10 = 14`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, _num1, num2) => {
        reduction.deleteNumOpt(cellM2, num2, cageM);
    },
    // `0b11_11 = 15`
    NOTHING_TO_REDUCE
];

/**
 * Empty reducing function.
 */
function NOTHING_TO_REDUCE() {
    // No-op.
}