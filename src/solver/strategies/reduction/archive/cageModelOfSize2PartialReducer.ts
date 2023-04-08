import { ReadonlyCombos } from '../../../math';
import { CageModel } from '../../../models/elements/cageModel';
import { CellModel } from '../../../models/elements/cellModel';
import { CageModelReducer } from '../cageModelReducer';
import { MasterModelReduction } from '../masterModelReduction';

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModelOfSize2PartialReducer implements CageModelReducer {

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

    private readonly _combosByNum: ReadonlyArray<ReadonlyCombos>;

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
        this._combosByNum = cageM.sumAddendsCombinatorics.combosByNum;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const deletedNumOpts_cellM0 = reduction.deletedNumOptsOf(this._cellM0);
        const deletedNumOpts_cellM1 = reduction.deletedNumOptsOf(this._cellM1);

        const cageMCombos = this._cageM.comboSet;

        let combo;

        if (deletedNumOpts_cellM0.isNotEmpty) {
            for (const num of deletedNumOpts_cellM0.nums) {
                if (!cageMCombos.hasCombo(combo = this._combosByNum[num][0])) continue;
                const complementNum = this._cageM.cage.sum - num;
                reduction.tryDeleteNumOpt(this._cellM1, complementNum, this._cageM);
                if (!this._cellM0.hasNumOpt(complementNum) || !this._cellM1.hasNumOpt(num)) {
                    reduction.tryDeleteNumOpt(this._cellM0, complementNum, this._cageM);
                    reduction.tryDeleteNumOpt(this._cellM1, num, this._cageM);
                    cageMCombos.deleteCombo(combo);
                }
            }
        }

        if (deletedNumOpts_cellM1.isNotEmpty) {
            for (const num of deletedNumOpts_cellM1.nums) {
                if (!cageMCombos.hasCombo(combo = this._combosByNum[num][0])) continue;
                const complementNum = this._cageM.cage.sum - num;
                reduction.tryDeleteNumOpt(this._cellM0, complementNum, this._cageM);
                if (!this._cellM1.hasNumOpt(complementNum) || !this._cellM0.hasNumOpt(num)) {
                    reduction.tryDeleteNumOpt(this._cellM0, num, this._cageM);
                    reduction.tryDeleteNumOpt(this._cellM1, complementNum, this._cageM);
                    cageMCombos.deleteCombo(combo);
                }
            }
        }
    }

}
