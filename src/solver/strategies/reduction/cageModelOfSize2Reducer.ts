import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

type TactialReducer = (
        cellM0: CellModel,
        cellM1: CellModel,
        cageM: CageModel,
        cageMCombos: CombosSet,
        combo: Combo,
        num0: number,
        num1: number,
        reduction: MasterModelReduction) => void;

function NOTHING_TO_REDUCE() {
    // No-op.
}

const tacticalReducers: ReadonlyArray<TactialReducer> = [
    ( // 0
            _cellM0: CellModel,
            _cellM1: CellModel,
            _cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo) => {
        cageMCombos.deleteCombo(combo);
    },
    ( // 1
            cellM0: CellModel,
            _cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            num0: number,
            _num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num0, cageM);
    },
    ( // 2
            cellM0: CellModel,
            _cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            _num0: number,
            num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num1, cageM);
    },
    ( // 3
            cellM0: CellModel,
            _cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            _num0: number,
            _num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM0, combo, cageM);
    },
    ( // 4
            _cellM0: CellModel,
            cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            num0: number,
            _num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    ( // 5
            cellM0: CellModel,
            cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            num0: number,
            _num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num0, cageM);
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    NOTHING_TO_REDUCE, // 6
    ( // 7
            cellM0: CellModel,
            _cellM1: CellModel,
            cageM: CageModel,
            _cageMCombos: CombosSet,
            _combo: Combo,
            num0: number,
            _num1: number,
            reduction: MasterModelReduction) => {
        reduction.deleteNumOpt(cellM0, num0, cageM);
    },
    ( // 8
            _cellM0: CellModel,
            cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            _num0: number,
            num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    NOTHING_TO_REDUCE, // 9
    ( // 10
            cellM0: CellModel,
            cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            _num0: number,
            num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num1, cageM);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    ( // 11
            cellM0: CellModel,
            _cellM1: CellModel,
            cageM: CageModel,
            _cageMCombos: CombosSet,
            _combo: Combo,
            _num0: number,
            num1: number,
            reduction: MasterModelReduction) => {
        reduction.deleteNumOpt(cellM0, num1, cageM);
    },
    ( // 12
            _cellM0: CellModel,
            cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            _num0: number,
            _num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM1, combo, cageM);
    },
    ( // 13
            _cellM0: CellModel,
            cellM1: CellModel,
            cageM: CageModel,
            _cageMCombos: CombosSet,
            _combo: Combo,
            num0: number,
            _num1: number,
            reduction: MasterModelReduction) => {
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    ( // 14
            _cellM0: CellModel,
            cellM1: CellModel,
            cageM: CageModel,
            _cageMCombos: CombosSet,
            _combo: Combo,
            _num0: number,
            num1: number,
            reduction: MasterModelReduction) => {
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    NOTHING_TO_REDUCE, // 15
];

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModelOfSize2Reducer implements CageModelReducer {

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
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const cellM0NumSetValue = this._cellM0._numOptsSet.bitStore;
        const cellM1NumSetValue = this._cellM1._numOptsSet.bitStore;

        const cageMCombos = this._cageM.comboSet;

        // Iterating over each registered `Combo` (there are up to 4 `Combo`s for a `Cage` with 2 `Cell`s) ...
        for (const combo of cageMCombos.combos) {
            const num0 = combo.number0;
            const num1 = combo.number1;

            const options =
                    (((cellM0NumSetValue & (1 << num0)) >> num0) |
                    ((cellM0NumSetValue & (1 << num1)) >> (num1 - 1))) |
                    (((cellM1NumSetValue & (1 << num0)) >> num0) |
                    ((cellM1NumSetValue & (1 << num1)) >> (num1 - 1))) << 2;

            tacticalReducers[options](this._cellM0, this._cellM1, this._cageM, cageMCombos, combo, num0, num1, reduction);
        }
    }

}
