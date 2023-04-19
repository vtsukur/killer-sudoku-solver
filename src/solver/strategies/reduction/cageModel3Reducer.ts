import * as _ from 'lodash';
import { Combo, SumAddendsCombinatorics } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet, ReadonlySudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { CageModel3ReductionDb, ComboReductionStatesByComboByCNPS } from './db/cageModel3ReductionDb';
import { MasterModelReduction } from './masterModelReduction';

const COMBO_INDICES = new Array<number>(1000);
for (const sum of _.range(6, 25)) {
    const combinatorics = SumAddendsCombinatorics.enumerate(sum, 3);
    for (const combo of combinatorics.val) {
        COMBO_INDICES[combo.key] = combinatorics.optimisticIndexOf(combo);
    }
}

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModel3Reducer implements CageModelReducer {

    /**
     * The {@link CageModel} to reduce.
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
     * Cache for {@link SudokuNumsSet} of possible number's options
     * for the first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM1NumsSet: ReadonlySudokuNumsSet;

    /**
     * Cache for the second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM2: CellModel;

    /**
     * Cache for {@link SudokuNumsSet} of possible number's options
     * for the second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM2NumsSet: ReadonlySudokuNumsSet;

    /**
     * Cache for the third {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM3: CellModel;

    /**
     * Cache for {@link SudokuNumsSet} of possible number's options
     * for the third {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM3NumsSet: ReadonlySudokuNumsSet;

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
        const cellM1NumsBits = this._cellM1NumsSet.bitStore;
        const cellM2NumsBits = this._cellM2NumsSet.bitStore;
        const cellM3NumsBits = this._cellM3NumsSet.bitStore;

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

            const reductionState = this._sumReductionStates[COMBO_INDICES[combo.key]][compressedNumbersPresenceState];

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

        return CageModel3ReductionDb.STATES[sum][COMBO_INDICES[combo.key]][compressedNumbersPresenceState];
    }

}
