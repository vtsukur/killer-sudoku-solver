import { Grid } from '../../puzzle/grid';
import { Sets } from '../../util/sets';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../sets';

export class NumsReduction {

    private _cellMs = new Set<CellModel>();
    private _impactedCageMs = new Set<CageModel>();
    private _deletedNumOptsPerCell = Grid.CELL_INDICES.map(() => SudokuNumsSet.newEmpty());

    deleteNumOpt(cellM: CellModel, num: number) {
        cellM.deleteNumOpt(num);
        this._deletedNumOptsPerCell[cellM.cell.index].add(num);
        this.add(cellM);
    }

    reduceNumOpts(cellM: CellModel, nums: ReadonlySudokuNumsSet) {
        const deletedNums = cellM.reduceNumOpts(nums);
        if (deletedNums.isNotEmpty) {
            this._deletedNumOptsPerCell[cellM.cell.index].addAll(deletedNums);
            this.add(cellM);
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

}
