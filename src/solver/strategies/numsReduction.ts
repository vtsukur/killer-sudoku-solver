import { Sets } from '../../util/sets';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';
import { ReadonlySudokuNumsSet } from '../sets';

export class NumsReduction {

    private _cellMs = new Set<CellModel>();
    private _impactedCageMs = new Set<CageModel>();

    deleteNumOpt(cellM: CellModel, num: number) {
        cellM.deleteNumOpt(num);
        this.add(cellM);
    }

    reduceNumOpts(cellM: CellModel, nums: ReadonlySudokuNumsSet) {
        const deletedNums = cellM.reduceNumOptsWithDeleted(nums);
        for (const deletedNum of deletedNums.nums()) {
            this.deleteNumOpt(cellM, deletedNum);
        }
    }

    private add(val: CellModel) {
        this._cellMs.add(val);
        Sets.U(this._impactedCageMs, val.withinCageModels);
        return this;
    }

    get isNotEmpty(): boolean {
        return this._impactedCageMs.size > 0;
    }

    get impactedCellModels(): ReadonlySet<CellModel> {
        return this._cellMs;
    }

    get impactedCageModels(): ReadonlySet<CageModel> {
        return this._impactedCageMs;
    }

    static forOne(cellM: CellModel) {
        return new NumsReduction().add(cellM);
    }

}
