import { BaseStrategy } from '../baseStrategy';

export class ReducePermsInCagesStrategy extends BaseStrategy {
    #cageSolversIterable;

    constructor(model, cageSolversIterable) {
        super(model);
        this.#cageSolversIterable = cageSolversIterable;
    }

    apply() {
        let iterate = true;

        while (iterate) {
            let modifiedCellModels = new Set();

            for (const cageSolver of this.#cageSolversIterable) {
                const currentlyModifiedCellModels = cageSolver.reduce();
                modifiedCellModels = new Set([...modifiedCellModels, ...currentlyModifiedCellModels]);
            }

            let moreCageSolversToReduce = new Set();
            for (const modifiedCellModel of modifiedCellModels.values()) {
                moreCageSolversToReduce = new Set([...moreCageSolversToReduce, ...modifiedCellModel.withinCageSolvers]);
            }

            this.#cageSolversIterable = moreCageSolversToReduce.values();
            iterate = moreCageSolversToReduce.size > 0;
        }
    }
}
