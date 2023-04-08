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
    ( // 2
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
    ( // 3
            _cellM0: CellModel,
            cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            num0: number,
            num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num0, cageM);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    ( // 4
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
    () => {  // 6
        // No-op
    },
    ( // 7
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
    ( // 8
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
    () => { // 9
        // No-op
    },
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
    ( // 12
            cellM0: CellModel,
            _cellM1: CellModel,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            num0: number,
            num1: number,
            reduction: MasterModelReduction) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num0, cageM);
        reduction.deleteNumOpt(cellM0, num1, cageM);
    },
    ( // 13
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
    ( // 14
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
    () => { // 15
        // No-op
    }
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
                    (((cellM1NumSetValue & (1 << num0)) >> num0) |
                    ((cellM1NumSetValue & (1 << num1)) >> (num1 - 1))) |
                    (((cellM0NumSetValue & (1 << num0)) >> num0) |
                    ((cellM0NumSetValue & (1 << num1)) >> (num1 - 1))) << 2;

            tacticalReducers[options](this._cellM0, this._cellM1, this._cageM, cageMCombos, combo, num0, num1, reduction);
        }
    }

}
