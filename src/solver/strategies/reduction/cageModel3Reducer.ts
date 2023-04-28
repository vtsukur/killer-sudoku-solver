// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet, ReadonlySudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CageModel3ReductionDb, ComboReductionState, ComboReductionStatesByComboByCNPS } from './db/cageModel3ReductionDb';
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
    private readonly _sumReductionStates: ComboReductionStatesByComboByCNPS;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;

        // [PERFORMANCE] Caching references for faster access in the `reduce` method.
        this._combosSet = cageM.comboSet;
        this._cellM1 = cageM.cellMs[0];
        this._cellM1NumsSet = this._cellM1._numOptsSet;
        this._cellM2 = cageM.cellMs[1];
        this._cellM2NumsSet = this._cellM2._numOptsSet;
        this._cellM3 = cageM.cellMs[2];
        this._cellM3NumsSet = this._cellM3._numOptsSet;
        this._sumReductionStates = CageModel3ReductionDb.STATES[cageM.cage.sum];
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const cellM1NumsBits = this._cellM1NumsSet.bits;
        const cellM2NumsBits = this._cellM2NumsSet.bits;
        const cellM3NumsBits = this._cellM3NumsSet.bits;

        let actualReductionStateCellM1 = 0;
        let actualReductionStateCellM2 = 0;
        let actualReductionStateCellM3 = 0;

        for (const combo of this._combosSet.combos) {
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

            const reductionState = this._sumReductionStates[combo.index][compressedNumbersPresenceState];

            if (reductionState.isValid) {
                actualReductionStateCellM1 |= reductionState.cell1KeepNumsBits;
                actualReductionStateCellM2 |= reductionState.cell2KeepNumsBits;
                actualReductionStateCellM3 |= reductionState.cell3KeepNumsBits;
            } else {
                this._combosSet.deleteCombo(combo);
            }
        }

        reduction.tryReduceNumOptsBits(this._cellM1, actualReductionStateCellM1, this._cageM);
        reduction.tryReduceNumOptsBits(this._cellM2, actualReductionStateCellM2, this._cageM);
        reduction.tryReduceNumOptsBits(this._cellM3, actualReductionStateCellM3, this._cageM);
    }

    static getReductionState(sum: number, combo: Combo, cellM1NumsBits: number, cellM2NumsBits: number, cellM3NumsBits: number) {
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

        return CageModel3ReductionDb.STATES[sum][combo.index][compressedNumbersPresenceState];
    }

}
