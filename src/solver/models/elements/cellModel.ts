import * as _ from 'lodash';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { InvalidSolverStepError } from '../../invalidSolverStateError';
import { CageModel } from './cageModel';

export class CellModel {
    readonly cell: Cell;
    placedNum?: number;
    private readonly _withinCageModels;
    private _numOpts;
    private _solved: boolean;

    constructor(cell: Cell) {
        this.cell = cell;
        this._solved = false;

        this._numOpts = new Set(_.range(House.SIZE).map(i => i + 1));
        this._withinCageModels = new Set();
    }

    deepCopyWithoutCageModels() {
        const copy = new CellModel(this.cell);
        copy.placedNum = this.placedNum;
        copy._solved = this._solved;
        copy._numOpts = new Set(this._numOpts);
        return copy;
    }

    addWithinCageModel(val: CageModel) {
        this._withinCageModels.add(val);
    }

    removeWithinCageModel(val: CageModel) {
        this._withinCageModels.delete(val);
    }

    get withinCageModels() {
        return this._withinCageModels;
    }

    numOpts(): ReadonlySet<number> {
        return this._numOpts;
    }

    hasNumOpt(val: number) {
        return this._numOpts.has(val);
    }

    deleteNumOpt(val: number) {
        if (this._numOpts.size === 1 && this._numOpts.has(val)) {
            throw new InvalidSolverStepError(`Requested to delete last number option ${val} for cell ${this.cell.key}`);
        }
        return this._numOpts.delete(val);
    }

    reduceNumOptions(val: ReadonlySet<number>) {
        const removedNumOptions = new Set<number>();
        for (const existingNumOption of this._numOpts) {
            if (!val.has(existingNumOption)) {
                removedNumOptions.add(existingNumOption);
            }
        }
        for (const numToRemove of removedNumOptions) {
            this.deleteNumOpt(numToRemove);
        }
        return removedNumOptions;
    }

    get solved() {
        return this._solved;
    }

    placeNum(val: number) {
        this.placedNum = val;
        this._numOpts = new Set([val]);
        this._solved = true;
    }
}   
