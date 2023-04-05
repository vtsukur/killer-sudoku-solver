import { Cell } from '../../../../../src/puzzle/cell';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../../../../src/solver/sets';

export class LockableCellModel extends CellModel {

    isLocked = false;

    private static readonly _EMPTY_NUMS_SET = SudokuNumsSet.newEmpty();

    constructor(cell: Cell) {
        super(cell);
    }

    deleteNumOpt(val: number) {
        if (!this.isLocked) {
            return super.deleteNumOpt(val);
        } else {
            return LockableCellModel._EMPTY_NUMS_SET;
        }
    }

    reduceNumOpts(val: ReadonlySudokuNumsSet): ReadonlySudokuNumsSet {
        if (!this.isLocked) {
            return super.reduceNumOpts(val);
        } else {
            return LockableCellModel._EMPTY_NUMS_SET;
        }
    }

}
