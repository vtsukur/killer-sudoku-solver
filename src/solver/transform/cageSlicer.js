import { Cage } from '../../problem/cage';

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

                this.#model.registerCage(residualCage);

                const cageModelsForResidualCage = this.#getCageModelsFullyContainingResidualCage(residualCage);
                const cagesToUnregister = [];
                cageModelsForResidualCage.forEach(firstChunkCageModel => {
                    const secondChunkCage = CageSlicer.#slice(firstChunkCageModel.cage, residualCage);
                    cagesToUnregister.push(firstChunkCageModel.cage);
                    nextResidualCages.push(secondChunkCage);
                });

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
        const secondChunkCageCells = [];
        cageToSlice.cells.forEach(cell => {
            if (firstChunkCage.cells.findIndex(aCell => aCell.key === cell.key) === -1) {
                secondChunkCageCells.push(cell);
            }
        });
        return new Cage(cageToSlice.sum - firstChunkCage.sum, secondChunkCageCells);
    }
}
