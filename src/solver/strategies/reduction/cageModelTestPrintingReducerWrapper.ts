import { compile } from 'ejs';
import { CageModel } from '../../models/elements/cageModel';
import { SudokuNumsSet } from '../../sets';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';
import { SRC_SOLVER_PATH, readTextFileSync } from '../../../util/files';

const UNIT_TEST_EJS_TEMPLATE_PATH = `${SRC_SOLVER_PATH}/strategies/reduction/cageModelUnitTest.ejs`;

const template = compile(readTextFileSync(UNIT_TEST_EJS_TEMPLATE_PATH));

let instance = 1;

export class CageModelTestPrintingReducerWrapper implements CageModelReducer {

    private readonly _cageM: CageModel;

    private readonly _delegate: CageModelReducer;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel, delegate: CageModelReducer) {
        this._cageM = cageM;
        this._delegate = delegate;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const numsPresentBeforeReduction = this._cageM.cellMs.map(cellM => cellM.numOpts());
        const numsDeletedBeforeReduction = this._cageM.cellMs.map(cellM => {
            return new SudokuNumsSet(reduction.deletedNumOptsOf(cellM)); // 1, 2
        });
        const combosBeforeReduction = this._cageM.combosSet.clone();

        this._delegate.reduce(reduction);

        const numsDeletedByReduction = this._cageM.cellMs.map((cellM, index) => {
            return new SudokuNumsSet(reduction.deletedNumOptsOf(cellM)).deleteAll(numsDeletedBeforeReduction[index]);
        });
        const combosAfterReduction = this._cageM.combosSet;
        if (numsDeletedByReduction.some(numsSet => numsSet.isNotEmpty)) {
            const testCode = template({
                instance: instance++,
                cageM: this._cageM,
                numsPresentBeforeReduction,
                combosBeforeReduction,
                combosAfterReduction,
                numsDeletedByReduction
            });

            console.log(testCode);
        }
    }

}
