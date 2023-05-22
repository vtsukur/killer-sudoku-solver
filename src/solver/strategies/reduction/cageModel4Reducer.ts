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
        this._combosSet = cageM.combosSet;
        this._cellMs = cageM.cellMs;
        this._firstCellM = cageM.cellMs[0];
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        //
        // The reduction works as follows:
        //
        //  - The algorithm selects `CellModel` with the minimum amount of
        //    _currently possible numbers_ calling it `minPossibleNumsCellM`.
        //    Fixating such a `CellModel` reduces iteration count.
        //    `minNums_cellM_updatedNumsBits` will accumulate
        //    _updated possible numbers_ of the `minPossibleNumsCellM`.
        //  - The rest of the `CellModel`s form a virtual sub-`Cage` with 3 `Cell`s
        //    These `CellModel`s have the names `cageM3_cellM1`, `cageM3_cellM2`, and `cageM3_cellM3`.
        //    The algorithm will apply `CageModel3Reducer` techniques to these `CellModel`s
        //    for efficient reduction.
        //    `cageM3_cellM1_updatedNumsBits`, `cageM3_cellM2_updatedNumsBits`,
        //    and `cageM3_cellM3_updatedNumsBits` will accumulate
        //    _updated possible numbers_ of the `cageM3_cellM1`, `cageM3_cellM2`, and `cageM3_cellM3` respectively.
        //  - The algorithm saves _currently possible `Combo`s_ to the `currentCombos`
        //    for the target `CageModel` and clears the `CombosSet` of the `CageModel`.
        //  - `updatedCombosBits` will accumulate _updated possible `Combo`s_ for the target `CageModel`.
        //

        // Finding `CellModel` with the minimum amount of _currently possible numbers_.
        let minNums_cellMIndex = 0;
        let minNums_cellM = this._firstCellM;
        let minNums = minNums_cellM._numOptsSet.nums;
        let i = 1;
        while (i < CAGE_SIZE) {
            const nums_cellM = this._cellMs[i];
            const nums = nums_cellM._numOptsSet.nums;
            if (nums.length < minNums.length) {
                minNums_cellMIndex = i;
                minNums_cellM = nums_cellM;
                minNums = nums;
            }
            ++i;
        }

        // Capturing precomputed indices of the `CellModel`s of the virtual sub-`Cage` with 3 `Cell`s.
        const idxs = CAGE_3_CELL_M_INDICES[minNums_cellMIndex];

        //
        // Capturing `CellModel`s of the virtual sub-`Cage` with 3 `Cell`s
        // and their _currently possible numbers_.
        //

        const cageM3_cellM1 = this._cellMs[idxs[0]];
        const cageM3_cellM1_currentNumsBits = cageM3_cellM1._numOptsSet.bits;

        const cageM3_cellM2 = this._cellMs[idxs[1]];
        const cageM3_cellM2_currentNumsBits = cageM3_cellM2._numOptsSet.bits;

        const cageM3_cellM3 = this._cellMs[idxs[2]];
        const cageM3_cellM3_currentNumsBits = cageM3_cellM3._numOptsSet.bits;

        // Initializing bits for the _updated possible numbers_ of the target `CageModel`.
        let minNums_cellM_updatedNumsBits = 0;
        let cageM3_cellM1_updatedNumsBits = 0;
        let cageM3_cellM2_updatedNumsBits = 0;
        let cageM3_cellM3_updatedNumsBits = 0;

        // Capturing _currently possible `Combo`s_ for the target `CageModel`.
        const currentCombos = this._combosSet.combos;

        //
        // Clearing _currently possible `Combo`s_ for the target `CageModel`
        // and initializing bits for the _updated possible `Combo`s_.
        //
        const updatedCombosSet = this._combosSet.clear();
        let updatedCombosBits = 0;

        for (const num of minNums) {
            for (const combo of currentCombos) {
                if ((combo.numsBits & (1 << num)) === 0) continue;

                const reducedCombo = Combo.BY_NUMS_BITS[combo.numsBits & ~(1 << num)];
                const reduction = CageModel3Reducer.getReduction(
                        reducedCombo,
                        cageM3_cellM1_currentNumsBits,
                        cageM3_cellM2_currentNumsBits,
                        cageM3_cellM3_currentNumsBits);
                if (reduction.isValid) {
                    cageM3_cellM1_updatedNumsBits |= reduction.keepCell1NumsBits;
                    cageM3_cellM2_updatedNumsBits |= reduction.keepCell2NumsBits;
                    cageM3_cellM3_updatedNumsBits |= reduction.keepCell3NumsBits;
                    updatedCombosBits |= 1 << combo.index;
                    minNums_cellM_updatedNumsBits |= 1 << num;
                }
            }
        }
        updatedCombosSet.setCombosBits(updatedCombosBits);

        reduction.tryReduceNumOptsBits(minNums_cellM, minNums_cellM_updatedNumsBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageM3_cellM1, cageM3_cellM1_updatedNumsBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageM3_cellM2, cageM3_cellM2_updatedNumsBits, this._cageM);
        reduction.tryReduceNumOptsBits(cageM3_cellM3, cageM3_cellM3_updatedNumsBits, this._cageM);
    }

}
