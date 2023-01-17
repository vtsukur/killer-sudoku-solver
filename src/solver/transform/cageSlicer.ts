import { Cage } from '../../puzzle/cage';
import { Cell } from '../../puzzle/cell';
import { House } from '../../puzzle/house';
import { CageModel } from '../models/elements/cageModel';
import { MasterModel } from '../models/masterModel';

type CageInSlicing = {
    cage: Cage;
    canHaveDuplicateNums: boolean;
};

export class CageSlicer {
    readonly model;

    constructor(model: MasterModel) {
        this.model = model;
    }

    addAndSliceResidualCageRecursively(initialResidualCage: Cage) {
        let residualCages = [ { cage: initialResidualCage, canHaveDuplicateNums: !CageModel.positioningFlagsFor(initialResidualCage.cells).isWithinHouse } ];

        while (residualCages.length > 0) {
            const nextResidualCages = new Array<CageInSlicing>();

            residualCages.forEach(entry => {
                const residualCage = entry.cage;
                if (this.model.cageModelsMap.has(residualCage.key)) return;

                const cageModelsForResidualCage = this.getCageModelsFullyContainingResidualCage(residualCage);
                const cagesToUnregister = new Array<Cage>();
                let canHaveDuplicateNums = entry.canHaveDuplicateNums;
                cageModelsForResidualCage.forEach((cageModel: CageModel) => {
                    const secondChunkCage = CageSlicer.slice(cageModel.cage, residualCage);
                    cagesToUnregister.push(cageModel.cage);
                    nextResidualCages.push({ cage: secondChunkCage, canHaveDuplicateNums: cageModel.canHaveDuplicateNums });
                    canHaveDuplicateNums = canHaveDuplicateNums && cageModel.canHaveDuplicateNums;
                });

                this.model.registerCage(residualCage, canHaveDuplicateNums);

                cagesToUnregister.forEach(cage => this.model.unregisterCage(cage));
            });

            residualCages = nextResidualCages;
        }
    }

    private getCageModelsFullyContainingResidualCage(residualCage: Cage) {
        let allAssociatedCageModelsSet = new Set<CageModel>();
        residualCage.cells.forEach(cell => {
            allAssociatedCageModelsSet = new Set([...allAssociatedCageModelsSet, ...this.model.cellModelOf(cell).withinCageModels]);
        });
        allAssociatedCageModelsSet.delete(this.model.cageModelsMap.get(residualCage.key) as CageModel);

        const result = new Array<CageModel>();
        for (const associatedCageModel of allAssociatedCageModelsSet.values()) {
            const associatedCageFullyContainsResidualCage = residualCage.cells.every(cell => {
                return this.model.cellModelOf(cell).withinCageModels.has(associatedCageModel);
            });
            if (associatedCageFullyContainsResidualCage) {
                result.push(associatedCageModel);
            }
        }

        return result;
    }

    static slice(cageToSlice: Cage, firstChunkCage: Cage) {
        const secondChunkCageBuilder = Cage.ofSum(cageToSlice.sum - firstChunkCage.sum);
        cageToSlice.cells.forEach(cell => {
            if (firstChunkCage.cells.findIndex(aCell => aCell.key === cell.key) === -1) {
                secondChunkCageBuilder.cell(cell);
            }
        });
        return secondChunkCageBuilder.mk();
    }

    static sliceBy(cageToSlice: Cage, sliceIndexFn: (cell: Cell) => number) {
        const slices: Array<Array<Cell>> = new Array(House.SIZE).fill([]).map(() => []);
        slices[0].push(Cell.at(0, 0));
        cageToSlice.cells.forEach((cell: Cell) => {
            const idx = sliceIndexFn(cell);
            slices[idx].push(cell);
        });
        return slices.filter(cells => cells.length > 0);
    }
}
