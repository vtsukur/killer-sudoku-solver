import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet, SudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

export class CageModel6PlusReducer implements CageModelReducer {

    private readonly _cageM: CageModel;

    private readonly _combosSet: CombosSet;

    private readonly _cellMs: ReadonlyArray<CellModel>;

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
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        if (this._combosSet.size === 1) return;

        let presentNumsBits = 0;
        for (const cellM of this._cellMs) {
            presentNumsBits |= cellM._numOptsSet.bitStore;
        }

        let commonComboNumsBits = 0;
        for (const combo of this._combosSet.combos) {
            commonComboNumsBits &= combo.numsBits;
        }

        if (commonComboNumsBits && (commonComboNumsBits & presentNumsBits) === 0) {
            throw new InvalidSolverStateError(`Common combo nums bits ${commonComboNumsBits} not found in CellModels for Cage ${this._cageM.cage.key}`);
        }

        const validComboNums = SudokuNumsSet.newEmpty();
        const noLongerValidCombos = new Array<Combo>();
        const noLongerValidComboNums = SudokuNumsSet.newEmpty();
        for (const combo of this._combosSet.combos) {
            let validCombo = true;
            for (const num of combo) {
                if (commonComboNumsBits & (1 << num)) continue;

                if ((presentNumsBits & (1 << num)) === 0) {
                    validCombo = false;
                    break;
                }
            }

            if (validCombo) {
                validComboNums.addAll(combo.numsSet);
            } else {
                noLongerValidCombos.push(combo);
                noLongerValidComboNums.addAll(combo.numsSet);
            }
        }

        if (noLongerValidCombos.length > 0) {
            const numOptsToDelete = new Set<number>();
            for (const num of noLongerValidComboNums.nums) {
                if (!validComboNums.has(num) && (presentNumsBits & (1 << num)) !== 0) {
                    numOptsToDelete.add(num);
                }
            }

            for (const cellM of this._cellMs) {
                for (const num of numOptsToDelete) {
                    reduction.tryDeleteNumOpt(cellM, num, this._cageM);
                }
            }

            for (const noLongerValidCombo of noLongerValidCombos) {
                this._combosSet.deleteCombo(noLongerValidCombo);
            }
        }
    }

}
