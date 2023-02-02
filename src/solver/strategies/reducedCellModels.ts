import { RichSet } from '../../util/richSet';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';

export class ReducedCellModels {
    private _cellMs: Set<CellModel> = new Set();
    private _impactedCageMs = new RichSet<CageModel>();

    add(val: Set<CellModel>) {
        for (const cellM of val) {
            this.addOne(cellM);
        }
        return this;
    }

    addOne(val: CellModel) {
        this._cellMs.add(val);
        this._impactedCageMs.addCollection(val.withinCageModels);
        return this;
    }

    get isNotEmpty(): boolean {
        return this._impactedCageMs.size > 0;
    }

    get impactedCageModels(): ReadonlySet<CageModel> {
        return this._impactedCageMs;
    }

    static forOne(cellM: CellModel) {
        return new ReducedCellModels().addOne(cellM);
    }
}
