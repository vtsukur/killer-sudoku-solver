import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';

export class ReducedCellModels {
    private _cellMs: Set<CellModel> = new Set();
    private _impactedCageMs: Set<CageModel> = new Set();

    add(val: Set<CellModel>): void {
        this._cellMs = ReducedCellModels.combine(this._cellMs, val);

        for (const cellM of this._cellMs) {
            this._impactedCageMs = ReducedCellModels.combine(this._impactedCageMs, cellM.withinCageModels);
        }
    }

    private static combine<T>(set: ReadonlySet<T>, andSet: ReadonlySet<T>) {
        return new Set([...set, ...andSet]);
    }

    get isNotEmpty(): boolean {
        return this._impactedCageMs.size > 0;
    }

    get impactedCageModels(): ReadonlySet<CageModel> {
        return this._impactedCageMs;
    }
}
