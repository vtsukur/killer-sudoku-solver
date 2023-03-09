import * as _ from 'lodash';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { Sets } from '../../../util/sets';
import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { CageModel } from './cageModel';

export class CellModel {

    readonly cell: Cell;
    placedNum?: number;
    private readonly _withinCageMs: Set<CageModel>;
    private _numOpts: Set<number>;
    private _solved: boolean;

    constructor(cell: Cell) {
        this.cell = cell;
        this._solved = false;

        this._numOpts = new Set(_.range(House.CELL_COUNT).map(i => i + 1));
        this._withinCageMs = new Set();
    }

    deepCopyWithoutCageModels() {
        const copy = new CellModel(this.cell);
        copy.placedNum = this.placedNum;
        copy._solved = this._solved;
        copy._numOpts = new Set(this._numOpts);
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
        return this._numOpts;
    }

    hasNumOpt(val: number) {
        return this._numOpts.has(val);
    }

    deleteNumOpt(val: number) {
        if (this._numOpts.size === 1 && this._numOpts.has(val)) {
            throw new InvalidSolverStateError(`Requested to delete last number option ${val} for cell ${this.cell.key}`);
        }
        return this._numOpts.delete(val);
    }

    reduceNumOptions(val: Set<number>) {
        const deletedNumOptions = new Set<number>();
        for (const existingNumOption of this._numOpts) {
            if (!val.has(existingNumOption)) {
                deletedNumOptions.add(existingNumOption);
            }
        }
        for (const numToDelete of deletedNumOptions) {
            this.deleteNumOpt(numToDelete);
        }
        return deletedNumOptions;
    }

    get solved() {
        return this._solved;
    }

    placeNum(val: number) {
        this.placedNum = val;
        this._numOpts = Sets.new(val);
        this._solved = true;
    }

}
