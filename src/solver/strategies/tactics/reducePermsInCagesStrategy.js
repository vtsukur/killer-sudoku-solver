import { BaseStrategy } from './baseStrategy';

export class ReducePermsInCagesStrategy extends BaseStrategy {
    #cageSolversIterable;

    constructor(cageSolversIterable) {
        super();
        this.#cageSolversIterable = cageSolversIterable;
    }

    apply() {
        let iterate = true;

        while (iterate) {
            let modifiedCellDets = new Set();

            for (const cageSolver of this.#cageSolversIterable) {
                const currentlyModifiedCellDets = cageSolver.reduce();
                modifiedCellDets = new Set([...modifiedCellDets, ...currentlyModifiedCellDets]);
            }

            let moreCageSolversToReduce = new Set();
            for (const modifiedCellDet of modifiedCellDets.values()) {
                moreCageSolversToReduce = new Set([...moreCageSolversToReduce, ...modifiedCellDet.withinCageSolvers]);
            }

            this.#cageSolversIterable = moreCageSolversToReduce.values();
            iterate = moreCageSolversToReduce.size > 0;
        }
    }
}
