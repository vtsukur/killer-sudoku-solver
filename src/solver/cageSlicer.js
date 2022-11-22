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
                if (this.#model.cagesSolversMap.has(residualCage.key)) return;

                this.#model.registerCage(residualCage);

                const cageSolversForResidualCage = this.#getCageSolversFullyContainingResidualCage(residualCage);
                const cagesToUnregister = [];
                cageSolversForResidualCage.forEach(firstChunkCageSolver => {
                    const secondChunkCage = firstChunkCageSolver.slice(residualCage);
                    cagesToUnregister.push(firstChunkCageSolver.cage);
                    nextResidualCages.push(secondChunkCage);
                });

                cagesToUnregister.forEach(cage => this.#model.unregisterCage(cage));
            });

            residualCages = nextResidualCages;
        }
    }

    #getCageSolversFullyContainingResidualCage(residualCage) {
        let allAssociatedCageSolversSet = new Set();
        residualCage.cells.forEach(cell => {
            allAssociatedCageSolversSet = new Set([...allAssociatedCageSolversSet, ...this.#model.cellSolverOf(cell).withinCageSolvers]);
        });
        allAssociatedCageSolversSet.delete(this.#model.cagesSolversMap.get(residualCage.key));

        const result = [];
        for (const associatedCageSolver of allAssociatedCageSolversSet.values()) {
            const associatedCageFullyContainsResidualCage = residualCage.cells.every(cell => {
                return this.#model.cellSolverOf(cell).withinCageSolvers.has(associatedCageSolver);
            });
            if (associatedCageFullyContainsResidualCage) {
                result.push(associatedCageSolver);
            }
        }

        return result;
    }
}
