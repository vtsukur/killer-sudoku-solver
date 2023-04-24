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

        let validComboNumsBits = 0;
        let validCombosBits = 0;
        const noLongerValidCombos = new Array<Combo>();
        let noLongerValidComboNumsBits = 0;
        for (const combo of this._combosSet.combos) {
            const nonCommonComboNumsBits = combo.numsBits & ~commonComboNumsBits;
            const validCombo = (presentNumsBits & nonCommonComboNumsBits) === nonCommonComboNumsBits;

            if (validCombo) {
                validComboNumsBits |= combo.numsBits;
                validCombosBits |= 1 << combo.index;
            } else {
                noLongerValidCombos.push(combo);
                noLongerValidComboNumsBits |= combo.numsBits;
            }
        }

        if (noLongerValidCombos.length > 0) {
            const deleteNumsBits = SudokuNumsSet.ALL_SUDOKU_NUMS_BIT_STORE ^ (noLongerValidComboNumsBits & ~validComboNumsBits);

            for (const cellM of this._cellMs) {
                reduction.tryReduceNumOptsBits(cellM, deleteNumsBits, this._cageM);
            }

            this._combosSet.setCombosBits(validCombosBits);
        }
    }

}
