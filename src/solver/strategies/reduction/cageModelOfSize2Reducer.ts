import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

type DenormalizedTacticalReducer = (
        reduction: MasterModelReduction,
        cageM: CageModel,
        cageMCombos: CombosSet,
        combo: Combo,
        cellM0: CellModel,
        cellM1: CellModel,
        num0: number,
        num1: number,
    ) => void;

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

        // Iterating over each possible `Combo` (there are up to 4 `Combo`s for a `Cage` with 2 `Cell`s) ...
        for (const combo of cageMCombos.combos) {
            const num0 = combo.number0;
            const num1 = combo.number1;

            const options =
                    (((cellM0NumSetValue & (1 << num0)) >> num0) |
                    ((cellM0NumSetValue & (1 << num1)) >> (num1 - 1))) |
                    (((cellM1NumSetValue & (1 << num0)) >> num0) |
                    ((cellM1NumSetValue & (1 << num1)) >> (num1 - 1))) << 2;

            DENORMALIZED_TACTICAL_REDUCERS[options](reduction, this._cageM, cageMCombos, combo, this._cellM0, this._cellM1, num0, num1);
        }
    }

}

const DENORMALIZED_TACTICAL_REDUCERS: ReadonlyArray<DenormalizedTacticalReducer> = [
    ( // 0
            _reduction: MasterModelReduction,
            _cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo) => {
        cageMCombos.deleteCombo(combo);
    },
    ( // 1
            reduction: MasterModelReduction,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            cellM0: CellModel,
            _cellM1: CellModel,
            num0: number) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num0, cageM);
    },
    ( // 2
            reduction: MasterModelReduction,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            cellM0: CellModel,
            _cellM1: CellModel,
            _num0: number,
            num1: number) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num1, cageM);
    },
    ( // 3
            reduction: MasterModelReduction,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            cellM0: CellModel) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM0, combo, cageM);
    },
    ( // 4
            reduction: MasterModelReduction,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            _cellM0: CellModel,
            cellM1: CellModel,
            num0: number) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    ( // 5
            reduction: MasterModelReduction,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            cellM0: CellModel,
            cellM1: CellModel,
            num0: number) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num0, cageM);
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    NOTHING_TO_REDUCE, // 6
    ( // 7
            reduction: MasterModelReduction,
            cageM: CageModel,
            _cageMCombos: CombosSet,
            _combo: Combo,
            cellM0: CellModel,
            _cellM1: CellModel,
            num0: number) => {
        reduction.deleteNumOpt(cellM0, num0, cageM);
    },
    ( // 8
            reduction: MasterModelReduction,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            _cellM0: CellModel,
            cellM1: CellModel,
            _num0: number,
            num1: number) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    NOTHING_TO_REDUCE, // 9
    ( // 10
            reduction: MasterModelReduction,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            cellM0: CellModel,
            cellM1: CellModel,
            _num0: number,
            num1: number) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteNumOpt(cellM0, num1, cageM);
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    ( // 11
            reduction: MasterModelReduction,
            cageM: CageModel,
            _cageMCombos: CombosSet,
            _combo: Combo,
            cellM0: CellModel,
            _cellM1: CellModel,
            _num0: number,
            num1: number) => {
        reduction.deleteNumOpt(cellM0, num1, cageM);
    },
    ( // 12
            reduction: MasterModelReduction,
            cageM: CageModel,
            cageMCombos: CombosSet,
            combo: Combo,
            _cellM0: CellModel,
            cellM1: CellModel) => {
        cageMCombos.deleteCombo(combo);
        reduction.deleteComboNumOpts(cellM1, combo, cageM);
    },
    ( // 13
            reduction: MasterModelReduction,
            cageM: CageModel,
            _cageMCombos: CombosSet,
            _combo: Combo,
            _cellM0: CellModel,
            cellM1: CellModel,
            num0: number) => {
        reduction.deleteNumOpt(cellM1, num0, cageM);
    },
    ( // 14
            reduction: MasterModelReduction,
            cageM: CageModel,
            _cageMCombos: CombosSet,
            _combo: Combo,
            _cellM0: CellModel,
            cellM1: CellModel,
            _num0: number,
            num1: number) => {
        reduction.deleteNumOpt(cellM1, num1, cageM);
    },
    NOTHING_TO_REDUCE, // 15
];

function NOTHING_TO_REDUCE() {
    // No-op.
}
