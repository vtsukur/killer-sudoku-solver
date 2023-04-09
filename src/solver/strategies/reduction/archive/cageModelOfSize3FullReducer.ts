import { CageModel } from '../../../models/elements/cageModel';
import { CageModelReducer } from '../cageModelReducer';
import { MasterModelReduction } from '../masterModelReduction';

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModelOfSize3FullReducer implements CageModelReducer {

    /**
     * The {@link CageModel} to reduce.
     */
    private readonly _cageM: CageModel;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const PERMS_OF_3 = [
            [0, 1, 2],
            [0, 2, 1],
            [1, 0, 2],
            [1, 2, 0],
            [2, 0, 1],
            [2, 1, 0]
        ];

        const cellMs = this._cageM.cellMs;
        const combosSet = this._cageM.comboSet;

        for (const cellM1 of cellMs) {
            const cellM1Index = cellMs.findIndex(c => c === cellM1);
            const remainingCellMs = [...cellMs];
            remainingCellMs.splice(cellM1Index, 1);
            const cellM2 = remainingCellMs[0];
            const cellM3 = remainingCellMs[1];

            for (const num1 of cellM1.numOpts()) {
                let numStands = false;
                for (const combo of combosSet.combos) {
                    if (!combo.has(num1)) continue;

                    const reducedCombo = combo.reduce(num1);
                    const num2 = reducedCombo.number1;
                    const num3 = reducedCombo.number2;

                    const hasFirstPerm = cellM2.hasNumOpt(num2) && cellM3.hasNumOpt(num3);
                    const hasSecondPerm = cellM2.hasNumOpt(num3) && cellM3.hasNumOpt(num2);
                    const hasAtLeastOnePerm = hasFirstPerm || hasSecondPerm;
                    numStands = numStands || hasAtLeastOnePerm;

                    if (hasAtLeastOnePerm) break;
                }
                if (!numStands) {
                    reduction.deleteNumOpt(cellM1, num1, this._cageM);
                }
            }
        }

        for (const combo of combosSet.combos) {
            let comboStands = false;
            for (const perm of PERMS_OF_3) {
                const cellM1HasIt = cellMs[0].hasNumOpt(combo.nthNumber(perm[0]));
                const cellM2HasIt = cellMs[1].hasNumOpt(combo.nthNumber(perm[1]));
                const cellM3HasIt = cellMs[2].hasNumOpt(combo.nthNumber(perm[2]));
                const someCellHasIt = cellM1HasIt && cellM2HasIt && cellM3HasIt;
                comboStands = comboStands || someCellHasIt;
            }
            if (!comboStands) {
                combosSet.deleteCombo(combo);
            }
        }
    }

}
