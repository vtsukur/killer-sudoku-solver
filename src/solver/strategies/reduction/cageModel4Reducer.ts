import { CageModel } from '../../models/elements/cageModel';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

export class CageModel4Reducer implements CageModelReducer {

    private readonly _cageM: CageModel;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 4 {@link Cell}s.
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
        //
    }

}
