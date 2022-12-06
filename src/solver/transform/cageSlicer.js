import { Cage } from '../../problem/cage';
import { House } from '../../problem/house';
import { CageModel } from '../models/elements/cageModel';

export class CageSlicer {
    #model;

    constructor(model) {
        this.#model = model;
    }

    addAndSliceResidualCageRecursively(initialResidualCage) {
        let residualCages = [ { cage: initialResidualCage, canHaveDuplicateNums: !CageModel.positioningFlagsFor(initialResidualCage.cells).isWithinHouse } ];

        while (residualCages.length > 0) {
            const nextResidualCages = [];

            residualCages.forEach(entry => {
                const residualCage = entry.cage;
                if (this.#model.cageModelsMap.has(residualCage.key)) return;

                const cageModelsForResidualCage = this.#getCageModelsFullyContainingResidualCage(residualCage);
                const cagesToUnregister = [];
                let canHaveDuplicateNums = entry.canHaveDuplicateNums;
                cageModelsForResidualCage.forEach(cageModel => {
                    const secondChunkCage = CageSlicer.slice(cageModel.cage, residualCage);
                    cagesToUnregister.push(cageModel.cage);
                    nextResidualCages.push({ cage: secondChunkCage, canHaveDuplicateNums: cageModel.canHaveDuplicateNums });
                    canHaveDuplicateNums = canHaveDuplicateNums && cageModel.canHaveDuplicateNums;
                });

                this.#model.registerCage(residualCage, canHaveDuplicateNums);

                cagesToUnregister.forEach(cage => this.#model.unregisterCage(cage));
            });

            residualCages = nextResidualCages;
        }
    }

    #getCageModelsFullyContainingResidualCage(residualCage) {
        let allAssociatedCageModelsSet = new Set();
        residualCage.cells.forEach(cell => {
            allAssociatedCageModelsSet = new Set([...allAssociatedCageModelsSet, ...this.#model.cellModelOf(cell).withinCageModels]);
        });
        allAssociatedCageModelsSet.delete(this.#model.cageModelsMap.get(residualCage.key));

        const result = [];
        for (const associatedCageModel of allAssociatedCageModelsSet.values()) {
            const associatedCageFullyContainsResidualCage = residualCage.cells.every(cell => {
                return this.#model.cellModelOf(cell).withinCageModels.has(associatedCageModel);
            });
            if (associatedCageFullyContainsResidualCage) {
                result.push(associatedCageModel);
            }
        }

        return result;
    }

    static slice(cageToSlice, firstChunkCage) {
        const secondChunkCageBuilder = Cage.ofSum(cageToSlice.sum - firstChunkCage.sum);
        cageToSlice.cells.forEach(cell => {
            if (firstChunkCage.cells.findIndex(aCell => aCell.key === cell.key) === -1) {
                secondChunkCageBuilder.cell(cell);
            }
        });
        return secondChunkCageBuilder.mk();
    }

    static sliceBy(cageToSlice, sliceIndexFn) {
        const slices = Array(House.SIZE).fill().map(() => []);
        cageToSlice.cells.forEach(cell => {
            const idx = sliceIndexFn(cell);
            slices[idx].push(cell);
        });
        return slices.filter(cells => cells.length > 0);
    }
}
