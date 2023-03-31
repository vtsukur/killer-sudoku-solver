import { Grid } from '../../../puzzle/grid';
import { Sets } from '../../../util/sets';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';

export class NumsReduction {

    private readonly _cellMs = new Set<CellModel>();
    private readonly _impactedCageMs = new Set<CageModel>();
    private readonly _deletedNumOptsPerCell = Grid.CELL_INDICES.map(() => SudokuNumsSet.newEmpty());

    deleteNumOpt(cellM: CellModel, num: number, cageM?: CageModel) {
        cellM.deleteNumOpt(num);
        this._deletedNumOptsPerCell[cellM.cell.index].add(num);
        this._cellMs.add(cellM);
        this.updateImpactedCageMs(cellM, cageM);
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
            this.updateImpactedCageMs(cellM, cageM);
        }
    }

    private updateImpactedCageMs(cellM: CellModel, cageM?: CageModel): void {
        if (cageM) {
            if (this._impactedCageMs.has(cageM)) {
                Sets.U(this._impactedCageMs, cellM.withinCageModels);
            } else {
                Sets.U(this._impactedCageMs, cellM.withinCageModels);
                this._impactedCageMs.delete(cageM);
            }
        } else {
            Sets.U(this._impactedCageMs, cellM.withinCageModels);
        }
    }

    deletedNumOptsOf(cellM: CellModel): ReadonlyArray<number> {
        return this._deletedNumOptsPerCell[cellM.cell.index].nums;
    }

    get isNotEmpty(): boolean {
        return this._cellMs.size > 0;
    }

    get impactedCageModels(): ReadonlySet<CageModel> {
        return this._impactedCageMs;
    }

}
