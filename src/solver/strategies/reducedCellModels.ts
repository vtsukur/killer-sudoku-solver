import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';

export class ReducedCellModels {
    private _cellMs: Set<CellModel> = new Set();
    private _cageMs: Set<CageModel> = new Set();

    addCellModels(val: Set<CellModel>): void {
        this._cellMs = ReducedCellModels.combine(this._cellMs, val);

        for (const cellM of this._cellMs) {
            this._cageMs = ReducedCellModels.combine(this._cageMs, cellM.withinCageModels);
        }
    }

    private static combine<T>(set: ReadonlySet<T>, andSet: ReadonlySet<T>) {
        return new Set([...set, ...andSet]);
    }

    get isNotEmpty(): boolean {
        return this._cageMs.size > 0;
    }

    get cageModelsToReduce(): ReadonlySet<CageModel> {
        return this._cageMs;
    }
}
