import { Cell } from '../../../../../src/puzzle/cell';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../../../../src/solver/sets';
import { Lockable } from './lockable';

export class LockableCellModel extends CellModel implements Lockable {

    private _isLocked = false;

    private static readonly _EMPTY_NUMS_SET = SudokuNumsSet.newEmpty();

    constructor(cell: Cell) {
        super(cell);
    }

    deleteNumOpt(val: number) {
        if (!this._isLocked) {
            return super.deleteNumOpt(val);
        } else {
            return LockableCellModel._EMPTY_NUMS_SET;
        }
    }

    reduceNumOpts(val: ReadonlySudokuNumsSet): ReadonlySudokuNumsSet {
        if (!this._isLocked) {
            return super.reduceNumOpts(val);
        } else {
            return LockableCellModel._EMPTY_NUMS_SET;
        }
    }

    lock() {
        this._isLocked = true;
    }

    unlock() {
        this._isLocked = false;
    }

}
