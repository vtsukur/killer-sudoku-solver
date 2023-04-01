import { Grid } from '../../../puzzle/grid';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';

export class NumsReduction {

    private readonly _cellMs = new Set<CellModel>();
    private readonly _deletedNumOptsPerCell = Grid.CELL_INDICES.map(() => SudokuNumsSet.newEmpty());

    private readonly _impactedCageMsArray = House.INDICES.map(() => new Set<CageModel>());
    // private readonly _cageSizesSet = SudokuNumsSet.newEmpty();
    private _impactedCageMsCount = 0;

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
            for (const aCageM of cellM.withinCageModels) {
                if (cageM !== aCageM) {
                    this.updateImpactedCageM(aCageM);
                }
            }
        } else {
            for (const aCageM of cellM.withinCageModels) {
                this.updateImpactedCageM(aCageM);
            }
        }
    }

    private updateImpactedCageM(cageM: CageModel) {
        const impactedCageMsSet = this._impactedCageMsArray[cageM.cellCount - 1];
        if (!impactedCageMsSet.has(cageM)) {
            impactedCageMsSet.add(cageM);
            // this._cageSizesSet.add(cageM.cellCount);
            ++this._impactedCageMsCount;
        }
    }

    deletedNumOptsOf(cellM: CellModel): ReadonlyArray<number> {
        return this._deletedNumOptsPerCell[cellM.cell.index].nums;
    }

    get isNotEmpty(): boolean {
        return this._impactedCageMsCount > 0;
    }

    peek(): CageModel | undefined {
        if (this._impactedCageMsCount === 0) return undefined;

        // const index = this._cageSizesSet.first as number - 1;
        // const impactedCageMsSet = this._impactedCageMsArray[index];
        // const cageM = impactedCageMsSet.values().next().value;
        // impactedCageMsSet.delete(cageM);
        // if (impactedCageMsSet.size === 0) {
        //     this._cageSizesSet.delete(cageM.cellCount);
        // }
        // --this._impactedCageMsCount;
        // return cageM;

        for (const impactedCageMsSet of this._impactedCageMsArray) {
            if (impactedCageMsSet.size > 0) {
                const cageM = impactedCageMsSet.values().next().value;
                impactedCageMsSet.delete(cageM);
                --this._impactedCageMsCount;
                return cageM;
            }
        }
    }

}
