import { BaseStrategy } from '../baseStrategy';

export class ReducePermsInCagesStrategy extends BaseStrategy {
    #cageModelsIterable;

    constructor(model, cageModelsIterable) {
        super(model);
        this.#cageModelsIterable = cageModelsIterable;
    }

    apply() {
        let iterate = true;

        while (iterate) {
            let modifiedCellModels = new Set();

            for (const cageModel of this.#cageModelsIterable) {
                const currentlyModifiedCellModels = cageModel.reduce();
                modifiedCellModels = new Set([...modifiedCellModels, ...currentlyModifiedCellModels]);
            }

            let moreCageModelsToReduce = new Set();
            for (const modifiedCellModel of modifiedCellModels.values()) {
                moreCageModelsToReduce = new Set([...moreCageModelsToReduce, ...modifiedCellModel.withinCageModels]);
            }

            this.#cageModelsIterable = moreCageModelsToReduce.values();
            iterate = moreCageModelsToReduce.size > 0;
        }
    }
}
