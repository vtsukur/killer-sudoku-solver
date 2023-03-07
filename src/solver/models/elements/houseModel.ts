import { ReadonlyCells } from '../../../puzzle/cell';
import { CageModel } from './cageModel';

export class HouseModel {

    readonly index: number;
    readonly cells: ReadonlyCells;

    private readonly _cageMs: Array<CageModel> = [];

    constructor(index: number, cells: ReadonlyCells) {
        this.index = index;
        this.cells = cells;
    }

    get cageModels(): ReadonlyArray<CageModel> {
        return this._cageMs;
    }

    addCageModel(val: CageModel) {
        this._cageMs.push(val);
    }

    removeCageModel(val: CageModel) {
        const indexToRemove = this._cageMs.indexOf(val);
        if (indexToRemove !== -1) {
            this._cageMs.splice(indexToRemove, 1);
        }
    }

}
