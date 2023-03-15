import { Cell } from '../../../puzzle/cell';
import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { ReadonlySudokuNumsCheckingSet, SudokuNumsCheckingSet } from '../../math/sudokuNumsCheckingSet';
import { CageModel } from './cageModel';

export class CellModel {

    readonly cell: Cell;
    placedNum?: number;
    private readonly _withinCageMs: Set<CageModel>;
    private _numOptsCheckingSet: SudokuNumsCheckingSet;
    private _solved: boolean;
    private _reevalNumOpts: boolean;
    private _numOptsSet: Set<number>;

    constructor(cell: Cell) {
        this.cell = cell;
        this._solved = false;

        this._numOptsCheckingSet = SudokuNumsCheckingSet.all();
        this._numOptsSet = new Set(this._numOptsCheckingSet.nums());
        this._reevalNumOpts = false;
        this._withinCageMs = new Set();
    }

    deepCopyWithoutCageModels() {
        const copy = new CellModel(this.cell);
        copy.placedNum = this.placedNum;
        copy._solved = this._solved;
        copy._numOptsCheckingSet = this._numOptsCheckingSet.clone();
        copy._numOptsSet = new Set(this._numOptsSet);
        copy._reevalNumOpts = this._reevalNumOpts;
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

    numOpts(): Set<number> {
        if (this._reevalNumOpts) {
            this._numOptsSet = new Set(this._numOptsCheckingSet.nums());
            this._reevalNumOpts = false;
        }
        return this._numOptsSet;
    }

    hasNumOpt(val: number) {
        return this._numOptsCheckingSet.hasOne(val);
    }

    deleteNumOpt(val: number) {
        if (this._numOptsCheckingSet.hasOnly(val)) {
            throw new InvalidSolverStateError(`Requested to delete last number option ${val} for cell ${this.cell.key}`);
        }
        this._reevalNumOpts = true;
        return this._numOptsCheckingSet.deleteOne(val);
    }

    reduceNumOptions(val: Set<number>) {
        const deletedNumOptions = new Set<number>();
        for (const existingNumOption of this.numOpts()) {
            if (!val.has(existingNumOption)) {
                deletedNumOptions.add(existingNumOption);
            }
        }
        for (const numToDelete of deletedNumOptions) {
            this.deleteNumOpt(numToDelete);
        }
        this._reevalNumOpts = true;
        return deletedNumOptions;
    }

    reduceNumOptionsByCheckingSet(val: ReadonlySudokuNumsCheckingSet) {
        this._numOptsCheckingSet.union(val);
        this._reevalNumOpts = true;
    }

    get solved() {
        return this._solved;
    }

    placeNum(val: number) {
        this.placedNum = val;
        this._numOptsCheckingSet = SudokuNumsCheckingSet.of(val);
        this._solved = true;
        this._reevalNumOpts = true;
    }

}
