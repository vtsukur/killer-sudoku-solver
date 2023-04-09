import { Cell } from '../../../../../src/puzzle/cell';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../../../../src/solver/sets';
import { Lockable } from './lockable';

export class LockableCellModel extends CellModel implements Lockable {

    private _isLocked = false;

    constructor(cell: Cell) {
        super(cell);
    }

    deleteNumOpt(val: number) {
        if (!this._isLocked) {
            return super.deleteNumOpt(val);
        } else {
            return SudokuNumsSet.EMPTY;
        }
    }

    deleteNumOpts(val: ReadonlySudokuNumsSet): ReadonlySudokuNumsSet {
        if (!this._isLocked) {
            return super.deleteNumOpts(val);
        } else {
            return SudokuNumsSet.EMPTY;
        }
    }

    reduceNumOpts(val: ReadonlySudokuNumsSet) {
        if (!this._isLocked) {
            return super.reduceNumOpts(val);
        } else {
            return SudokuNumsSet.EMPTY;
        }
    }

    lock() {
        this._isLocked = true;
    }

}
