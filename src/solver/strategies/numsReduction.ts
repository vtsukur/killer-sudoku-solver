import { Sets } from '../../util/sets';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';

export class NumsReduction {

    private _cellMs = new Set<CellModel>();
    private _impactedCageMs = new Set<CageModel>();

    add(val: CellModel) {
        this._cellMs.add(val);
        Sets.U(this._impactedCageMs, val.withinCageModels);
        return this;
    }

    addAll(val: ReadonlySet<CellModel>) {
        for (const cellM of val) {
            this.add(cellM);
        }
        return this;
    }

    get isNotEmpty(): boolean {
        return this._impactedCageMs.size > 0;
    }

    get impactedCageModels(): ReadonlySet<CageModel> {
        return this._impactedCageMs;
    }

    static forOne(cellM: CellModel) {
        return new NumsReduction().add(cellM);
    }

}
