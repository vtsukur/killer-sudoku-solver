import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { CageModel3Reducer } from './cageModel3Reducer';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';
import { Combo } from '../../math';

const CAGE_SIZE = 5;
const CAGE_3_CELL_M_INDICES: ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>> = [
    [
        [],          // 00
        [ 2, 3, 4 ], // 01
        [ 1, 3, 4 ], // 02
        [ 1, 2, 4 ], // 03
        [ 1, 2, 3 ]  // 04
    ],
    [
        [ 2, 3, 4 ], // 10
        [],          // 11
        [ 0, 3, 4 ], // 12
        [ 0, 2, 4 ], // 13
        [ 0, 2, 3 ]  // 14
    ],
    [
        [ 1, 3, 4 ], // 20
        [ 0, 3, 4 ], // 21
        [],          // 22
        [ 0, 1, 4 ], // 23
        [ 0, 1, 3 ]  // 24
    ],
    [
        [ 1, 2, 4 ], // 30
        [ 0, 2, 4 ], // 31
        [ 0, 1, 4 ], // 32
        [],          // 33
        [ 0, 1, 2 ]  // 34
    ],
    [
        [ 1, 2, 3 ], // 40
        [ 0, 2, 3 ], // 41
        [ 0, 1, 3 ], // 42
        [ 0, 1, 2 ], // 43
        []           // 44
    ]
];

export class CageModel5Reducer implements CageModelReducer {

    private readonly _cageM: CageModel;

    private readonly _combosSet: CombosSet;

    private readonly _cellMs: ReadonlyArray<CellModel>;

    private readonly _firstCellM: CellModel;

    private readonly _secondCellM: CellModel;

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
        this._secondCellM = cageM.cellMs[1];
        this._sum = cageM.cage.sum;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        // Finding `CellModel` with the minimal amount of number options.
        let minNumCountCellM1;
        let minNumCountCellM1Index;
        let minNumCountCellM2;
        let minNumCountCellM2Index;
        if (this._firstCellM._numOptsSet.nums.length <= this._secondCellM._numOptsSet.nums.length) {
            minNumCountCellM1 = this._firstCellM;
            minNumCountCellM1Index = 0;
            minNumCountCellM2 = this._secondCellM;
            minNumCountCellM2Index = 1;
        } else {
            minNumCountCellM1 = this._secondCellM;
            minNumCountCellM1Index = 1;
            minNumCountCellM2 = this._firstCellM;
            minNumCountCellM2Index = 0;
        }
        let minNumCountCellM1Nums = minNumCountCellM1._numOptsSet.nums;
        let minNumCountCellM2Nums = minNumCountCellM2._numOptsSet.nums;
        let i = 2;
        while (i < CAGE_SIZE) {
            const currentCellM = this._cellMs[i];
            const currentNumCountNums = currentCellM._numOptsSet.nums;
            if (currentNumCountNums.length < minNumCountCellM1Nums.length) {
                minNumCountCellM2 = minNumCountCellM1;
                minNumCountCellM2Index = minNumCountCellM1Index;
                minNumCountCellM2Nums = minNumCountCellM1Nums;

                minNumCountCellM1 = currentCellM;
                minNumCountCellM1Index = i;
                minNumCountCellM1Nums = currentNumCountNums;
            } else if (currentNumCountNums.length < minNumCountCellM2Nums.length) {
                minNumCountCellM2 = currentCellM;
                minNumCountCellM2Index = i;
                minNumCountCellM2Nums = currentNumCountNums;
            }

            ++i;
        }

        let minNumCountCellM1NumBits = 0;
        let minNumCountCellM2NumBits = 0;

        const indices = CAGE_3_CELL_M_INDICES[minNumCountCellM1Index][minNumCountCellM2Index];
        const cageModel3CellM1 = this._cellMs[indices[0]];
        const cageModel3CellM1NumBits = cageModel3CellM1._numOptsSet.bits;
        let cageModel3CellM1ActualNumBits = 0;

        const cageModel3CellM2 = this._cellMs[indices[1]];
        const cageModel3CellM2NumBits = cageModel3CellM2._numOptsSet.bits;
        let cageModel3CellM2ActualNumBits = 0;

        const cageModel3CellM3 = this._cellMs[indices[2]];
        const cageModel3CellM3NumBits = cageModel3CellM3._numOptsSet.bits;
        let cageModel3CellM3ActualNumBits = 0;

        const combosBeforeReduction = this._combosSet.combos;
        const updatedCombosSet = this._combosSet.clear();

        let combosBits = 0;
        for (const num1 of minNumCountCellM1Nums) {
            for (const num2 of minNumCountCellM2Nums) {
                if (num1 === num2) continue;

                for (const combo of combosBeforeReduction) {
                    if ((combo.numsBits & (1 << num1 | 1 << num2)) !== (1 << num1 | 1 << num2)) continue;

                    const reducedCombo = Combo.BY_NUMS_BITS[combo.numsBits & ~((1 << num1) | (1 << num2))];
                    const reduction = CageModel3Reducer.getReduction(
                            reducedCombo,
                            cageModel3CellM1NumBits,
                            cageModel3CellM2NumBits,
                            cageModel3CellM3NumBits);
                    if (reduction.isValid) {
                        cageModel3CellM1ActualNumBits |= reduction.keepCell1NumsBits;
                        cageModel3CellM2ActualNumBits |= reduction.keepCell2NumsBits;
                        cageModel3CellM3ActualNumBits |= reduction.keepCell3NumsBits;
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
