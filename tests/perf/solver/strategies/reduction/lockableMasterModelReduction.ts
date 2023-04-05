import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { ReadonlySudokuNumsSet } from '../../../../../src/solver/sets';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { Lockable } from './lockable';

export class LockableMasterModelReduction extends MasterModelReduction implements Lockable {

    private _isLocked = false;

    protected addDeletedNum(cellM: CellModel, num: number) {
        if (!this._isLocked) {
            super.addDeletedNum(cellM, num);
        }
    }

    protected addDeletedNums(cellM: CellModel, nums: ReadonlySudokuNumsSet) {
        if (!this._isLocked) {
            super.addDeletedNums(cellM, nums);
        }
    }

    protected updateImpactedCageM(cageM: CageModel) {
        if (!this._isLocked) {
            super.updateImpactedCageM(cageM);
        }
    }

    lock() {
        this._isLocked = true;
    }

}
