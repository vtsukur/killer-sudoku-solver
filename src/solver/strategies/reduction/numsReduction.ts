import { Grid } from '../../../puzzle/grid';
import { Sets } from '../../../util/sets';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';

export class NumsReduction {

    private readonly _cellMs = new Set<CellModel>();
    private readonly _deletedNumOptsPerCell = Grid.CELL_INDICES.map(() => SudokuNumsSet.newEmpty());

    deleteNumOpt(cellM: CellModel, num: number, cageM?: CageModel) {
        cellM.deleteNumOpt(num);
        this._deletedNumOptsPerCell[cellM.cell.index].add(num);
        this._cellMs.add(cellM);
    }

    tryDeleteNumOpt(cellM: CellModel, num: number, cageM?: CageModel) {
        if (cellM.hasNumOpt(num)) {
            this.deleteNumOpt(cellM, num, cageM);
        }
    }

    tryReduceNumOpts(cellM: CellModel, nums: ReadonlySudokuNumsSet, cageM?: CageModel) {
        const deletedNums = cellM.reduceNumOpts(nums);
        if (deletedNums.isNotEmpty) {
            this._deletedNumOptsPerCell[cellM.cell.index].addAll(deletedNums);
            this._cellMs.add(cellM);
        }
    }

    deletedNumOptsOf(cellM: CellModel): ReadonlyArray<number> {
        return this._deletedNumOptsPerCell[cellM.cell.index].nums;
    }

    get isNotEmpty(): boolean {
        return this._cellMs.size > 0;
    }

    get impactedCageModels(): ReadonlySet<CageModel> {
        const val = new Set<CageModel>();
        for (const cellM of this._cellMs) {
            Sets.U(val, cellM.withinCageModels);
        }
        return val;
    }

}
