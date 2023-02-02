import * as _ from 'lodash';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { MutableSet } from '../../../util/mutableSet';
import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { CageModel } from './cageModel';

export class CellModel {
    readonly cell: Cell;
    placedNum?: number;
    private readonly _withinCageMs: MutableSet<CageModel>;
    private _numOpts: MutableSet<number>;
    private _solved: boolean;

    constructor(cell: Cell) {
        this.cell = cell;
        this._solved = false;

        this._numOpts = new MutableSet(_.range(House.CELL_COUNT).map(i => i + 1));
        this._withinCageMs = new MutableSet();
    }

    deepCopyWithoutCageModels() {
        const copy = new CellModel(this.cell);
        copy.placedNum = this.placedNum;
        copy._solved = this._solved;
        copy._numOpts = new MutableSet(this._numOpts);
        return copy;
    }

    addWithinCageModel(val: CageModel) {
        this._withinCageMs.add(val);
    }

    removeWithinCageModel(val: CageModel) {
        this._withinCageMs.delete(val);
    }

    get withinCageModels(): ReadonlySet<CageModel> {
        return this._withinCageMs;
    }

    numOpts(): MutableSet<number> {
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

    reduceNumOptions(val: MutableSet<number>) {
        const removedNumOptions = new MutableSet<number>();
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
        this._numOpts = MutableSet.of(val);
        this._solved = true;
    }
}
