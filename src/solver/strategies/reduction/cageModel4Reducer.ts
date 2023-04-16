import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { SudokuNumsSet } from '../../sets';
import { CageModel3Reducer } from './cageModel3Reducer';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

const CAGE_SIZE = 4;
const CAGE_3_CELL_M_INDICES: ReadonlyArray<ReadonlyArray<number>> = [
    [ 1, 2, 3 ],
    [ 0, 2, 3 ],
    [ 0, 1, 3 ],
    [ 0, 1, 2 ]
];

export class CageModel4Reducer implements CageModelReducer {

    private readonly _cageM: CageModel;

    private readonly _cellMs: ReadonlyArray<CellModel>;

    private readonly _sum: number;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 4 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._cellMs = cageM.cellMs;
        this._sum = cageM.cage.sum;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        // Finding `CellModel` with the minimal amount of number options.
        let minNumCountCellM = this._cellMs[0];
        let minNumCountCellMIndex = 0;
        let minNumCount = this._cellMs[0].numOpts().length;
        let i = 1;
        while (i < CAGE_SIZE) {
            const currentCellM = this._cellMs[i];
            const currentNumCount = currentCellM.numOpts().length;
            if (currentNumCount < minNumCount) {
                minNumCountCellM = currentCellM;
                minNumCountCellMIndex = i;
                minNumCount = currentNumCount;
            }

            ++i;
        }

        const cageModel3CellM1Index = CAGE_3_CELL_M_INDICES[minNumCountCellMIndex][0];
        const cageModel3CellM1 = this._cellMs[cageModel3CellM1Index];
        const cageModel3CellM1NumBits = cageModel3CellM1._numOptsSet.bitStore;
        let cageModel3CellM1ActualNumBits = 0;

        const cageModel3CellM2Index = CAGE_3_CELL_M_INDICES[minNumCountCellMIndex][1];
        const cageModel3CellM2 = this._cellMs[cageModel3CellM2Index];
        const cageModel3CellM2NumBits = cageModel3CellM2._numOptsSet.bitStore;
        let cageModel3CellM2ActualNumBits = 0;

        const cageModel3CellM3Index = CAGE_3_CELL_M_INDICES[minNumCountCellMIndex][2];
        const cageModel3CellM3 = this._cellMs[cageModel3CellM3Index];
        const cageModel3CellM3NumBits = cageModel3CellM3._numOptsSet.bitStore;
        let cageModel3CellM3ActualNumBits = 0;

        const combosBeforeReduction = this._cageM.comboSet.combos;
        const updatedCombosSet = this._cageM.comboSet.clear();

        for (const num of minNumCountCellM.numOpts()) {
            const reducedSum = this._sum - num;
            let atLeastOneReducedComboValid = false;
            for (const combo of combosBeforeReduction) {
                if (!combo.has(num)) continue;

                const reducedCombo = combo.reduce(num);
                const reductionState = CageModel3Reducer.getReductionState(
                        reducedSum,
                        reducedCombo,
                        cageModel3CellM1NumBits,
                        cageModel3CellM2NumBits,
                        cageModel3CellM3NumBits);
                if (reductionState.isValid) {
                    const reducedComboNumBits = reducedCombo.numsSet.bitStore;
                    cageModel3CellM1ActualNumBits |= (cageModel3CellM1NumBits & reducedComboNumBits & ~reductionState.deleteNumsInCell1.bitStore);
                    cageModel3CellM2ActualNumBits |= (cageModel3CellM2NumBits & reducedComboNumBits & ~reductionState.deleteNumsInCell2.bitStore);
                    cageModel3CellM3ActualNumBits |= (cageModel3CellM3NumBits & reducedComboNumBits & ~reductionState.deleteNumsInCell3.bitStore);
                    atLeastOneReducedComboValid = true;
                    updatedCombosSet.addCombo(combo);
                }
            }
            if (!atLeastOneReducedComboValid) {
                reduction.deleteNumOpt(minNumCountCellM, num, this._cageM);
            }
        }

        this._cageM.comboSet = updatedCombosSet;

        reduction.tryReduceNumOpts(cageModel3CellM1, new SudokuNumsSet(cageModel3CellM1ActualNumBits), this._cageM);
        reduction.tryReduceNumOpts(cageModel3CellM2, new SudokuNumsSet(cageModel3CellM2ActualNumBits), this._cageM);
        reduction.tryReduceNumOpts(cageModel3CellM3, new SudokuNumsSet(cageModel3CellM3ActualNumBits), this._cageM);
    }

}
