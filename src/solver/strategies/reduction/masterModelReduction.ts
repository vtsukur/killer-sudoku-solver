import { Grid } from '../../../puzzle/grid';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';

export class MasterModelReduction {

    private readonly _deletedNumOptsPerCell = Grid.CELL_INDICES.map(() => SudokuNumsSet.newEmpty());

    private readonly _impactedCageMsArray: Array<Array<CageModel>> = House.INDICES.map(() => []);
    private _minCageSizeIndex = this._impactedCageMsArray.length;
    private _impactedCageMsCount = 0;

    deleteNumOpt(cellM: CellModel, num: number, cageM?: CageModel) {
        cellM.deleteNumOpt(num);
        this._deletedNumOptsPerCell[cellM.cell.index].add(num);
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
            this._deletedNumOptsPerCell[cellM.cell.index].addAll(deletedNums);
            this.markAsImpacted(cellM, cageM);
        }
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

    private updateImpactedCageM(cageM: CageModel) {
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

    deletedNumOptsOf(cellM: CellModel): ReadonlyArray<number> {
        return this._deletedNumOptsPerCell[cellM.cell.index].nums;
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
