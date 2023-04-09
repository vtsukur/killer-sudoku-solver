import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

type DenormalizedTacticalReducer = (
        reduction: MasterModelReduction,
        cageM: CageModel,
        cageMCombos: CombosSet,
        combo: Combo,
        cellM0: CellModel,
        cellM1: CellModel,
        num0: number,
        num1: number,
    ) => void;

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModelOfSize2Reducer implements CageModelReducer {

    /**
     * The {@link CageModel} to reduce.
     */
    private readonly _cageM: CageModel;

    /**
     * The first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM0: CellModel;

    /**
     * The second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM1: CellModel;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._cellM0 = cageM.cellMs[0];
        this._cellM1 = cageM.cellMs[1];
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        //
        // [PERFORMANCE] Storing possible numbers for both `CellModel`s as bit masks
        // for efficient low-level number check and manipulation.
        //
        const cellM0NumsBits = this._cellM0._numOptsSet.bitStore;
        const cellM1NumsBits = this._cellM1._numOptsSet.bitStore;

        // Storing `CageModel`'s `ComboSet` to reference the object once.
        const cageMCombos = this._cageM.comboSet;

        // Iterating over each possible `Combo` (there are up to 4 `Combo`s for a `Cage` with 2 `Cell`s) ...
        for (const combo of cageMCombos.combos) {
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
            const num0 = combo.number0;
            const num1 = combo.number1;

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
                    ((cellM0NumsBits & (1 << num0)) >> num0) |
                    ((cellM0NumsBits & (1 << num1)) >> (num1 - 1)) |
                    (
                        ((cellM1NumsBits & (1 << num0)) >> num0) |
                        ((cellM1NumsBits & (1 << num1)) >> (num1 - 1))
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
                    reduction, this._cageM, cageMCombos, combo,
                    this._cellM0, this._cellM1,
                    num0, num1
            );
        }
    }

}

/**
 * Readonly array of 16 pre-coded denormalized reducing functions
 * with hardcoded actions relevant to specific `Combo` numbers in the `CellModel`s.
 *
 * Denormalized reducing functions are indexed by a 4-bit compressed state
 * representing the presence of `Combo` numbers within `CellModel`s:
 *
 *  - The first bit is set if the first `Combo` number is possible in `CellModel` 1.
 *  - The second bit is set if the second `Combo` number is possible in `CellModel` 1.
 *  - The third bit is set if the first `Combo` number is possible in `CellModel` 2.
 *  - The fourth bit is set if the second `Combo` number is possible in `CellModel` 2.
 *
 * Full table of cases for the `Combo` of `[num0, num1]`:
 *
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | Input                                                                          | Reducing Actions                                                      | Output                                                      |
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | Compressed State | `CellModel` 2 - `Combo` Nums | `CellModel` 1 - `Combo` Nums | For `CellModel` 2        | For `CellModel` 1        | Delete `Combo`? | `CellModel` 2 - `Combo` Nums | `CellModel` 1 - `Combo` Nums |
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | 0b0000 =  0      | <none>                       | <none>                       | <none>                   | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b0001 =  1      | <none>                       | `num0`                       | <none>                   | delete `num0`            | yes             | <none>                       | <none>                       |
 * | 0b0010 =  2      | <none>                       | `num1`                       | <none>                   | delete `num1`            | yes             | <none>                       | <none>                       |
 * | 0b0011 =  3      | <none>                       | `num0`, `num1`               | <none>                   | delete `num0` and `num1` | yes             | <none>                       | <none>                       |
 * | 0b0100 =  4      | `num0`                       | <none>                       | delete `num0`            | <none>                   | yes             | <none>                       | <none>                       |
 * | 0b0101 =  5      | `num0`                       | `num0`                       | delete `num0`            | delete `num0`            | yes             | <none>                       | <none>                       |
 * | 0b0110 =  6      | `num0`                       | `num1`                       | <none>                   | <none>                   | no              | `num0`                       | `num1`                       |
 * | 0b0111 =  7      | `num0`                       | `num0`, `num1`               | <none>                   | delete `num0`            | no              | `num0`                       | `num1`                       |
 * | 0b1000 =  8      | `num1`                       | <none>                       | delete `num1`            | <none>                   | ye              | <none>                       | <none>                       |
 * | 0b1001 =  9      | `num1`                       | `num0`                       | <none>                   | <none>                   | no              | `num1`                       | `num0`                       |
 * | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 */
const DENORMALIZED_TACTICAL_REDUCERS: ReadonlyArray<DenormalizedTacticalReducer> = [
    // 0
    (_reduction: MasterModelReduction, _cageM: CageModel, combos: CombosSet, combo: Combo) => {
        combos.deleteCombo(combo);
    },
    // 1
    (reduction: MasterModelReduction, cageM: CageModel, combos: CombosSet, combo: Combo, cellM0: CellModel, _cellM1: CellModel, num0: number) => {
        combos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num0, cageM);
    },
    // 2
    (reduction: MasterModelReduction, cageM: CageModel, combos: CombosSet, combo: Combo, cellM0: CellModel, _cellM1: CellModel, _num0: number, num1: number) => {
        combos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num1, cageM);
    },
    // 3
    (reduction: MasterModelReduction, cageM: CageModel, combos: CombosSet, combo: Combo, cellM0: CellModel) => {
        combos.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM0, combo, cageM);
    },
    // 4
    (reduction: MasterModelReduction, cageM: CageModel, combos: CombosSet, combo: Combo, _cellM0: CellModel, cellM1: CellModel, num0: number) => {
        combos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    // 5
    (reduction: MasterModelReduction, cageM: CageModel, combos: CombosSet, combo: Combo, cellM0: CellModel, cellM1: CellModel, num0: number) => {
        combos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num0, cageM);
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    // 6
    NOTHING_TO_REDUCE,
    // 7
    (reduction: MasterModelReduction, cageM: CageModel, _combos: CombosSet, _combo: Combo, cellM0: CellModel, _cellM1: CellModel, num0: number) => {
        reduction.deleteNumOpt(cellM0, num0, cageM);
    },
    // 8
    (reduction: MasterModelReduction, cageM: CageModel, combos: CombosSet, combo: Combo, _cellM0: CellModel, cellM1: CellModel, _num0: number, num1: number) => {
        combos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    // 9
    NOTHING_TO_REDUCE,
    // 10
    (reduction: MasterModelReduction, cageM: CageModel, combos: CombosSet, combo: Combo, cellM0: CellModel, cellM1: CellModel, _num0: number, num1: number) => {
        combos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num1, cageM);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    // 11
    (reduction: MasterModelReduction, cageM: CageModel, _combos: CombosSet, _combo: Combo, cellM0: CellModel, _cellM1: CellModel, _num0: number, num1: number) => {
        reduction.deleteNumOpt(cellM0, num1, cageM);
    },
    // 12
    (reduction: MasterModelReduction, cageM: CageModel, combos: CombosSet, combo: Combo, _cellM0: CellModel, cellM1: CellModel) => {
        combos.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM1, combo, cageM);
    },
    // 13
    (reduction: MasterModelReduction, cageM: CageModel, _combos: CombosSet, _combo: Combo, _cellM0: CellModel, cellM1: CellModel, num0: number) => {
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    // 14
    (reduction: MasterModelReduction, cageM: CageModel, _combos: CombosSet, _combo: Combo, _cellM0: CellModel, cellM1: CellModel, _num0: number, num1: number) => {
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    // 15
    NOTHING_TO_REDUCE
];

/**
 * Empty reducing function.
 */
function NOTHING_TO_REDUCE() {
    // No-op.
}
