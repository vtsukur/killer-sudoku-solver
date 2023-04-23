import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { CageModel3Reducer } from './cageModel3Reducer';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';
import { Combo } from '../../math';

export class CageModel5Reducer implements CageModelReducer {

    private readonly _cageM: CageModel;

    private readonly _combosSet: CombosSet;

    private readonly _cellMs: ReadonlyArray<CellModel>;

    private readonly _firstCellM: CellModel;

    private readonly _sum: number;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 5 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._combosSet = cageM.comboSet;
        this._cellMs = cageM.cellMs;
        this._firstCellM = cageM.cellMs[0];
        this._sum = cageM.cage.sum;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const cellMsSortedByNumsCount = [...this._cellMs].sort((a, b) => a._numOptsSet.nums.length - b._numOptsSet.nums.length);
        const minNumCountCellM1 = cellMsSortedByNumsCount[0];
        let minNumCountCellM1NumBits = 0;
        const minNumCountCellM2 = cellMsSortedByNumsCount[1];
        let minNumCountCellM2NumBits = 0;

        const cageModel3CellM1 = cellMsSortedByNumsCount[2];
        const cageModel3CellM1NumBits = cageModel3CellM1._numOptsSet.bitStore;
        let cageModel3CellM1ActualNumBits = 0;

        const cageModel3CellM2 = cellMsSortedByNumsCount[3];
        const cageModel3CellM2NumBits = cageModel3CellM2._numOptsSet.bitStore;
        let cageModel3CellM2ActualNumBits = 0;

        const cageModel3CellM3 = cellMsSortedByNumsCount[4];
        const cageModel3CellM3NumBits = cageModel3CellM3._numOptsSet.bitStore;
        let cageModel3CellM3ActualNumBits = 0;

        const combosBeforeReduction = this._combosSet.combos;
        const updatedCombosSet = this._combosSet.clear();

        let combosBits = 0;
        for (const num1 of minNumCountCellM1._numOptsSet.nums) {
            for (const num2 of minNumCountCellM2._numOptsSet.nums) {
                if (num1 === num2) continue;

                const reducedSum = this._sum - num1 - num2;

                for (const combo of combosBeforeReduction) {
                    if (!(combo.has(num1) && combo.has(num2))) continue;

                    const reducedCombo = Combo.BY_NUMS_BITS[combo.numsBits & ~((1 << num1) | (1 << num2))];
                    const reductionState = CageModel3Reducer.getReductionState(
                            reducedSum,
                            reducedCombo,
                            cageModel3CellM1NumBits,
                            cageModel3CellM2NumBits,
                            cageModel3CellM3NumBits);
                    if (reductionState.isValid) {
                        cageModel3CellM1ActualNumBits |= reductionState.cell1KeepNumsBits;
                        cageModel3CellM2ActualNumBits |= reductionState.cell2KeepNumsBits;
                        cageModel3CellM3ActualNumBits |= reductionState.cell3KeepNumsBits;
                        minNumCountCellM1NumBits |= 1 << num1;
                        minNumCountCellM2NumBits |= 1 << num2;
                        combosBits |= 1 << combo.index;
                    }
                }
            }
        }

        updatedCombosSet.setCombosBits(combosBits);

        reduction.tryReduceNumOptsBits(minNumCountCellM1, minNumCountCellM1NumBits, this._cageM);
        reduction.tryReduceNumOptsBits(minNumCountCellM2, minNumCountCellM2NumBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageModel3CellM1, cageModel3CellM1ActualNumBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageModel3CellM2, cageModel3CellM2ActualNumBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageModel3CellM3, cageModel3CellM3ActualNumBits, this._cageM);
    }

}
