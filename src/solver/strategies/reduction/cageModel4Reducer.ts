import * as _ from 'lodash';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet, SudokuNumsSet } from '../../sets';
import { CageModel3Reducer } from './cageModel3Reducer';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';
import { SumCombos } from '../../math';

const CAGE_SIZE = 4;
const CAGE_3_CELL_M_INDICES: ReadonlyArray<ReadonlyArray<number>> = [
    [ 1, 2, 3 ],
    [ 0, 2, 3 ],
    [ 0, 1, 3 ],
    [ 0, 1, 2 ]
];

const COMBO_INDICES = new Array<number>(10000);
for (const sum of _.range(10, 31)) {
    const combinatorics = SumCombos.enumerate(sum, 4);
    for (const combo of combinatorics.val) {
        COMBO_INDICES[combo.key] = combinatorics.optimisticIndexOf(combo);
    }
}

const SUM_ADDENDS_COMBINATORICS_3 = new Array<SumCombos>(25);
for (const sum of _.range(6, 25)) {
    SUM_ADDENDS_COMBINATORICS_3[sum] = SumCombos.enumerate(sum, 3);
}

export class CageModel4Reducer implements CageModelReducer {

    private readonly _cageM: CageModel;

    private readonly _combosSet: CombosSet;

    private readonly _cellMs: ReadonlyArray<CellModel>;

    private readonly _firstCellM: CellModel;

    private readonly _sum: number;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 4 {@link Cell}s.
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
        // Finding `CellModel` with the minimal amount of number options.
        let minNumCountCellM = this._firstCellM;
        let minNumCountCellMIndex = 0;
        let minNumCountNums = this._firstCellM._numOptsSet.nums;
        let i = 1;
        while (i < CAGE_SIZE) {
            const currentCellM = this._cellMs[i];
            const currentNumCountNums = currentCellM._numOptsSet.nums;
            if (currentNumCountNums.length < currentNumCountNums.length) {
                minNumCountCellM = currentCellM;
                minNumCountCellMIndex = i;
                minNumCountNums = currentNumCountNums;
            }

            ++i;
        }

        const indices = CAGE_3_CELL_M_INDICES[minNumCountCellMIndex];

        const cageModel3CellM1 = this._cellMs[indices[0]];
        const cageModel3CellM1NumBits = cageModel3CellM1._numOptsSet.bitStore;
        let cageModel3CellM1ActualNumBits = 0;

        const cageModel3CellM2 = this._cellMs[indices[1]];
        const cageModel3CellM2NumBits = cageModel3CellM2._numOptsSet.bitStore;
        let cageModel3CellM2ActualNumBits = 0;

        const cageModel3CellM3 = this._cellMs[indices[2]];
        const cageModel3CellM3NumBits = cageModel3CellM3._numOptsSet.bitStore;
        let cageModel3CellM3ActualNumBits = 0;

        const combosBeforeReduction = this._combosSet.combos;
        const updatedCombosSet = this._combosSet.clear();

        let minCellMDeleteNumsBits = 0;
        let combosBits = 0;
        for (const num of minNumCountNums) {
            const reducedSum = this._sum - num;
            let atLeastOneReducedComboValid = false;
            for (const combo of combosBeforeReduction) {
                if (!combo.has(num)) continue;

                const reducedCombo = SUM_ADDENDS_COMBINATORICS_3[reducedSum].optimisticGetByBits(combo.numsSet.bitStore & ~(1 << num));
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
                    atLeastOneReducedComboValid = true;
                    combosBits |= 1 << COMBO_INDICES[combo.key];
                }
            }
            if (!atLeastOneReducedComboValid) {
                minCellMDeleteNumsBits |= 1 << num;
            }
        }
        updatedCombosSet.setCombosBits(combosBits);

        if (minCellMDeleteNumsBits !== 0) {
            reduction.deleteNumOpts(minNumCountCellM, new SudokuNumsSet(minCellMDeleteNumsBits), this._cageM);
        }
        reduction.tryReduceNumOptsBits(cageModel3CellM1, cageModel3CellM1ActualNumBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageModel3CellM2, cageModel3CellM2ActualNumBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageModel3CellM3, cageModel3CellM3ActualNumBits, this._cageM);
    }

}
