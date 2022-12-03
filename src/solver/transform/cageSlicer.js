import { Cage } from '../../problem/cage';
import { CageModel } from '../models/elements/cageModel';

export class CageSlicer {
    #model;

    constructor(model) {
        this.#model = model;
    }

    addAndSliceResidualCageRecursively(initialResidualCage) {
        let residualCages = [ initialResidualCage ];

        while (residualCages.length > 0) {
            const nextResidualCages = [];

            residualCages.forEach(residualCage => {
                if (this.#model.cageModelsMap.has(residualCage.key)) return;

                const cageModelsForResidualCage = this.#getCageModelsFullyContainingResidualCage(residualCage);
                const cagesToUnregister = [];
                let canHaveDuplicateNums = /* refactor */!(new CageModel(residualCage, []).positioningFlags.isWithinHouse);
                cageModelsForResidualCage.forEach(cageModel => {
                    const secondChunkCage = CageSlicer.#slice(cageModel.cage, residualCage);
                    cagesToUnregister.push(cageModel.cage);
                    nextResidualCages.push(secondChunkCage);
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

    static #slice(cageToSlice, firstChunkCage) {
        const secondChunkCageBuilder = Cage.ofSum(cageToSlice.sum - firstChunkCage.sum);
        cageToSlice.cells.forEach(cell => {
            if (firstChunkCage.cells.findIndex(aCell => aCell.key === cell.key) === -1) {
                secondChunkCageBuilder.cell(cell);
            }
        });
        return secondChunkCageBuilder.mk();
    }
}
