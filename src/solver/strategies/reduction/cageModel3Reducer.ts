import * as fs from 'node:fs';
import { parse } from 'yaml';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet, ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';
import { CageSizeNReductionsDb } from './db/reductionDb';
import { Combo, SumAddendsCombinatorics } from '../../math';

type ReductionState = {
    isValid: boolean;
    comboNumsBits: number;
    deleteNumsInCell1Bits: number;
    deleteNumsInCell2Bits: number;
    deleteNumsInCell3Bits: number;
    keepNumsInCell1Bits: number;
    keepNumsInCell2Bits: number;
    keepNumsInCell3Bits: number;
};

const INVALID_REDUCTION_STATE: ReductionState = {
    isValid: false,
    comboNumsBits: 0,
    deleteNumsInCell1Bits: 0,
    deleteNumsInCell2Bits: 0,
    deleteNumsInCell3Bits: 0,
    keepNumsInCell1Bits: 0,
    keepNumsInCell2Bits: 0,
    keepNumsInCell3Bits: 0
};

const dbString = fs.readFileSync('./src/solver/strategies/reduction/db/cage3_reductions.yaml', 'utf-8');
const db = parse(dbString) as CageSizeNReductionsDb;

const ALL_REDUCTION_STATES: Array<Array<ReadonlyArray<ReductionState>>> = new Array(db[db.length - 1].sum + 1);
const COMBO_INDICES = new Array<number>(1000);
db.forEach(sumReductions => {
    const combinatorics = SumAddendsCombinatorics.enumerate(sumReductions.sum, 3);
    ALL_REDUCTION_STATES[sumReductions.sum] = sumReductions.combos.map(comboReductions => {
        const combo = Combo.of(...comboReductions.combo);
        const comboNumsSet = combo.numsSet;
        const reductionStates = new Array<ReductionState>(512).fill(INVALID_REDUCTION_STATE);
        for (const entry of comboReductions.entries) {
            if (entry.actions) {
                const cellM1DeletedNums = SudokuNumsSet.of(...entry.actions.deleteNums[0]);
                const cellM2DeletedNums = SudokuNumsSet.of(...entry.actions.deleteNums[1]);
                const cellM3DeletedNums = SudokuNumsSet.of(...entry.actions.deleteNums[2]);
                reductionStates[entry.state] = {
                    isValid: true,
                    comboNumsBits: comboNumsSet.bitStore,
                    deleteNumsInCell1Bits: cellM1DeletedNums.bitStore,
                    deleteNumsInCell2Bits: cellM2DeletedNums.bitStore,
                    deleteNumsInCell3Bits: cellM3DeletedNums.bitStore,
                    keepNumsInCell1Bits: comboNumsSet.bitStore & ~cellM1DeletedNums.bitStore,
                    keepNumsInCell2Bits: comboNumsSet.bitStore & ~cellM2DeletedNums.bitStore,
                    keepNumsInCell3Bits: comboNumsSet.bitStore & ~cellM3DeletedNums.bitStore
                };
            } else {
                reductionStates[entry.state] = {
                    isValid: true,
                    comboNumsBits: comboNumsSet.bitStore,
                    deleteNumsInCell1Bits: 0,
                    deleteNumsInCell2Bits: 0,
                    deleteNumsInCell3Bits: 0,
                    keepNumsInCell1Bits: comboNumsSet.bitStore,
                    keepNumsInCell2Bits: comboNumsSet.bitStore,
                    keepNumsInCell3Bits: comboNumsSet.bitStore
                };
            }
        }
        COMBO_INDICES[combo.numKey] = combinatorics.optimisticIndexOf(combo);
        return reductionStates;
    });
});

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

    private readonly _sumReductionStates: ReadonlyArray<ReadonlyArray<ReductionState>>;

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
        this._sumReductionStates = ALL_REDUCTION_STATES[cageM.cage.sum];
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

            const reductionState = this._sumReductionStates[COMBO_INDICES[combo.numKey]][compressedNumbersPresenceState];

            if (reductionState.isValid) {
                actualReductionStateCellM1 |= (cellM1NumsBits & reductionState.keepNumsInCell1Bits);
                actualReductionStateCellM2 |= (cellM2NumsBits & reductionState.keepNumsInCell2Bits);
                actualReductionStateCellM3 |= (cellM3NumsBits & reductionState.keepNumsInCell3Bits);
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

        return ALL_REDUCTION_STATES[sum][COMBO_INDICES[combo.numKey]][compressedNumbersPresenceState];
    }

}
