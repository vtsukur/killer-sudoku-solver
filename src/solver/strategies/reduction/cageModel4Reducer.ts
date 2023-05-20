// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../puzzle/cell';
import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { CageModel3Reducer } from './cageModel3Reducer';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

/**
 * Static size of a {@link Cage} with 4 {@link Cell}s.
 */
const CAGE_SIZE = 4;

const CAGE_3_CELL_M_INDICES: ReadonlyArray<ReadonlyArray<number>> = [
    [ 1, 2, 3 ],
    [ 0, 2, 3 ],
    [ 0, 1, 3 ],
    [ 0, 1, 2 ]
];

/**
 * High-performance implementation of reducer of _possible numbers_ for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 4 {@link Cell}s.
 *
 * Checks the validity of numbers given _possible {@link Combo}s_ for the {@link CageModel}
 * and does reduction for individual {@link Combo}s
 * reusing {@link CageModel3Reducer} for combinatorics performance.
 *
 * @public
 */
export class CageModel4Reducer implements CageModelReducer {

    /**
     * {@link CageModel} to reduce.
     */
    private readonly _cageM: CageModel;

    /**
     * Cache for the {@link CageModel}'s {@link CombosSet}.
     */
    private readonly _combosSet: CombosSet;

    /**
     * Cache for the {@link CellModel}s of the {@link CageModel}.
     */
    private readonly _cellMs: ReadonlyArray<CellModel>;

    /**
     * Cache for the first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _firstCellM: CellModel;

    /**
     * Constructs a new reducer of _possible numbers_ for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 4 {@link Cell}s.
     *
     * @param cageM — {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._combosSet = cageM.comboSet;
        this._cellMs = cageM.cellMs;
        this._firstCellM = cageM.cellMs[0];
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        let minNumCountCellM = this._firstCellM;
        let minNumCountCellMIndex = 0;
        let minNumCountNums = this._firstCellM._numOptsSet.nums;
        let i = 1;
        while (i < CAGE_SIZE) {
            const currentCellM = this._cellMs[i];
            const currentNumCountNums = currentCellM._numOptsSet.nums;
            if (currentNumCountNums.length < minNumCountNums.length) {
                minNumCountCellM = currentCellM;
                minNumCountCellMIndex = i;
                minNumCountNums = currentNumCountNums;
            }

            ++i;
        }

        let minNumCountCellMNumBits = 0;

        const indices = CAGE_3_CELL_M_INDICES[minNumCountCellMIndex];

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
        for (const num of minNumCountNums) {
            for (const combo of combosBeforeReduction) {
                if ((combo.numsBits & (1 << num)) === 0) continue;

                const reducedCombo = Combo.BY_NUMS_BITS[combo.numsBits & ~(1 << num)];
                const reduction = CageModel3Reducer.getReduction(
                        reducedCombo,
                        cageModel3CellM1NumBits,
                        cageModel3CellM2NumBits,
                        cageModel3CellM3NumBits);
                if (reduction.isValid) {
                    cageModel3CellM1ActualNumBits |= reduction.keepCell1NumsBits;
                    cageModel3CellM2ActualNumBits |= reduction.keepCell2NumsBits;
                    cageModel3CellM3ActualNumBits |= reduction.keepCell3NumsBits;
                    combosBits |= 1 << combo.index;
                    minNumCountCellMNumBits |= 1 << num;
                }
            }
        }
        updatedCombosSet.setCombosBits(combosBits);

        reduction.tryReduceNumOptsBits(minNumCountCellM, minNumCountCellMNumBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageModel3CellM1, cageModel3CellM1ActualNumBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageModel3CellM2, cageModel3CellM2ActualNumBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageModel3CellM3, cageModel3CellM3ActualNumBits, this._cageM);
    }

}
