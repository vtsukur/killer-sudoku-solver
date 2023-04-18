import { Cell } from '../../../puzzle/cell';
import { joinArray } from '../../../util/readableMessages';
import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';
import { CageModel } from './cageModel';

export class CellModel {

    readonly cell: Cell;
    placedNum?: number;
    private readonly _withinCageMs: Set<CageModel>;
    _numOptsSet: SudokuNumsSet;
    private _solved: boolean;

    constructor(cell: Cell) {
        this.cell = cell;
        this._solved = false;

        this._numOptsSet = SudokuNumsSet.newAll();
        this._withinCageMs = new Set();
    }

    deepCopyWithoutCageModels() {
        const copy = new CellModel(this.cell);
        copy.placedNum = this.placedNum;
        copy._solved = this._solved;
        copy._numOptsSet = this._numOptsSet.clone();
        return copy;
    }

    addWithinCageModel(val: CageModel) {
        this._withinCageMs.add(val);
    }

    deleteWithinCageModel(val: CageModel) {
        this._withinCageMs.delete(val);
    }

    get withinCageModels(): ReadonlySet<CageModel> {
        return this._withinCageMs;
    }

    numOpts(): ReadonlyArray<number> {
        return this._numOptsSet.nums;
    }

    numOptsSet(): ReadonlySudokuNumsSet {
        return this._numOptsSet;
    }

    hasNumOpt(val: number) {
        return this._numOptsSet.has(val);
    }

    deleteNumOpt(val: number): void {
        if (this._numOptsSet.hasOnly(val)) {
            throw new InvalidSolverStateError(`Requested to delete last number option ${val} for cell ${this.cell.key}`);
        }
        this._numOptsSet.delete(val);
    }

    deleteNumOpts(val: ReadonlySudokuNumsSet): void {
        if (val.hasAll(this._numOptsSet)) {
            throw new InvalidSolverStateError(`Requested to delete last number options ${joinArray(val.nums)} for cell ${this.cell.key}`);
        }
        this._numOptsSet.deleteAll(val);
    }

    reduceNumOpts(val: ReadonlySudokuNumsSet): ReadonlySudokuNumsSet {
        return val.bitStore == SudokuNumsSet.ALL.bitStore ? SudokuNumsSet.EMPTY : this._numOptsSet.unionWithDeleted(val);
    }

    reduceNumOptsBits(val: number): ReadonlySudokuNumsSet {
        return val == SudokuNumsSet.ALL.bitStore ? SudokuNumsSet.EMPTY : this._numOptsSet.unionBitsWithDeleted(val);
    }

    get solved() {
        return this._solved;
    }

    placeNum(val: number) {
        this.placedNum = val;
        this._numOptsSet.setOne(val);
        this._solved = true;
    }

}
