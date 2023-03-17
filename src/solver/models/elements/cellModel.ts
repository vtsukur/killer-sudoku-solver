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

    numOpts(): ReadonlyArray<number> {
        return this._numOptsCheckingSet.nums();
    }

    hasNumOpt(val: number) {
        return this._numOptsCheckingSet.has(val);
    }

    deleteNumOpt(val: number) {
        if (this._numOptsCheckingSet.hasOnly(val)) {
            throw new InvalidSolverStateError(`Requested to delete last number option ${val} for cell ${this.cell.key}`);
        }
        return this._numOptsCheckingSet.delete(val);
    }

    reduceNumOptionsByCheckingSet(val: ReadonlySudokuNumsCheckingSet): boolean {
        const oldVal = this._numOptsCheckingSet.bitStore;
        this._numOptsCheckingSet.union(val);
        return this._numOptsCheckingSet.bitStore !== oldVal;
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
