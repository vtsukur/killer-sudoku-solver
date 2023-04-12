import { Grid } from '../../../puzzle/grid';
import { House } from '../../../puzzle/house';
import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';

export class MasterModelReduction {

    private readonly _deletedNumsTracker: ReadonlyArray<SudokuNumsSet> = Grid.CELL_INDICES.map(() => SudokuNumsSet.newEmpty());;

    private readonly _impactedCageMsArray: Array<Array<CageModel>> = House.INDICES.map(() => []);
    private _minCageSizeIndex = this._impactedCageMsArray.length;
    private _impactedCageMsCount = 0;

    deleteNumOpt(cellM: CellModel, num: number, cageM?: CageModel) {
        cellM.deleteNumOpt(num);
        this.addDeletedNum(cellM, num);
        this.markAsImpacted(cellM, cageM);
    }

    deleteComboNumOpts(cellM: CellModel, combo: Combo, cageM?: CageModel) {
        this.deleteNumOpts(cellM, combo.numsSet, cageM);
    }

    deleteNumOpts(cellM: CellModel, nums: ReadonlySudokuNumsSet, cageM?: CageModel) {
        cellM.deleteNumOpts(nums);
        this.addDeletedNums(cellM, nums);
        this.markAsImpacted(cellM, cageM);
    }

    tryDeleteNumOpt(cellM: CellModel, num: number, cageM?: CageModel) {
        if (cellM.hasNumOpt(num)) {
            this.deleteNumOpt(cellM, num, cageM);
        }
    }

    tryReduceNumOpts(cellM: CellModel, nums: ReadonlySudokuNumsSet, cageM?: CageModel) {
        const deletedNums = cellM.reduceNumOpts(nums);
        if (deletedNums.isNotEmpty) {
            this.addDeletedNums(cellM, deletedNums);
            this.markAsImpacted(cellM, cageM);
        }
    }

    protected addDeletedNum(cellM: CellModel, num: number) {
        this._deletedNumsTracker[cellM.cell.index].add(num);
    }

    protected addDeletedNums(cellM: CellModel, nums: ReadonlySudokuNumsSet) {
        this._deletedNumsTracker[cellM.cell.index].addAll(nums);
    }

    markAsImpacted(cellM: CellModel, cageM?: CageModel): void {
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

    protected updateImpactedCageM(cageM: CageModel) {
        const index = cageM.cellCount - 1;
        const impactedCageMsSet = this._impactedCageMsArray[index];
        if (impactedCageMsSet.indexOf(cageM) === -1) {
            impactedCageMsSet.push(cageM);
            if (index < this._minCageSizeIndex) {
                this._minCageSizeIndex = index;
            }
            ++this._impactedCageMsCount;
        }
    }

    deletedNumOptsOf(cellM: CellModel): ReadonlySudokuNumsSet {
        return this._deletedNumsTracker[cellM.cell.index];
    }

    hasNoDeletedNumOpts(cellM: CellModel): boolean {
        return this._deletedNumsTracker[cellM.cell.index].isEmpty;
    }

    get isNotEmpty(): boolean {
        return this._impactedCageMsCount > 0;
    }

    peek(): CageModel | undefined {
        if (this._impactedCageMsCount === 0) return undefined;

        let index = this._minCageSizeIndex;
        while (index < this._impactedCageMsArray.length && this._impactedCageMsArray[index].length === 0) {
            ++index;
        }
        this._minCageSizeIndex = index;
        const impactedCageMsSet = this._impactedCageMsArray[this._minCageSizeIndex];

        const cageM = impactedCageMsSet[0];
        impactedCageMsSet.splice(0, 1);
        --this._impactedCageMsCount;
        return cageM;
    }

}
