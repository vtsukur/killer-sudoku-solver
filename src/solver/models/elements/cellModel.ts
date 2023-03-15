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

    constructor(cell: Cell) {
        this.cell = cell;
        this._solved = false;

        this._numOptsCheckingSet = SudokuNumsCheckingSet.all();
        this._withinCageMs = new Set();
    }

    deepCopyWithoutCageModels() {
        const copy = new CellModel(this.cell);
        copy.placedNum = this.placedNum;
        copy._solved = this._solved;
        copy._numOptsCheckingSet = this._numOptsCheckingSet.clone();
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
        return new Set(this._numOptsCheckingSet.nums());
    }

    hasNumOpt(val: number) {
        return this._numOptsCheckingSet.hasOne(val);
    }

    deleteNumOpt(val: number) {
        if (this._numOptsCheckingSet.hasOnly(val)) {
            throw new InvalidSolverStateError(`Requested to delete last number option ${val} for cell ${this.cell.key}`);
        }
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
        return deletedNumOptions;
    }

    reduceNumOptionsByCheckingSet(val: ReadonlySudokuNumsCheckingSet) {
        this._numOptsCheckingSet.union(val);
    }

    get solved() {
        return this._solved;
    }

    placeNum(val: number) {
        this.placedNum = val;
        this._numOptsCheckingSet = SudokuNumsCheckingSet.of(val);
        this._solved = true;
    }

}
