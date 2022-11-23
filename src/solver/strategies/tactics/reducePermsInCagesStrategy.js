import { BaseStrategy } from '../baseStrategy';

export class ReducePermsInCagesStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    apply(ctx) {
        let iterate = true;

        let cageModelsIterable = ctx.cageModelsToReevaluatePerms;

        while (iterate) {
            let modifiedCellModels = new Set();

            for (const cageModel of cageModelsIterable) {
                const currentlyModifiedCellModels = cageModel.reduce();
                modifiedCellModels = new Set([...modifiedCellModels, ...currentlyModifiedCellModels]);
            }

            let moreCageModelsToReduce = new Set();
            for (const modifiedCellModel of modifiedCellModels.values()) {
                moreCageModelsToReduce = new Set([...moreCageModelsToReduce, ...modifiedCellModel.withinCageModels]);
            }

            cageModelsIterable = moreCageModelsToReduce.values();
            iterate = moreCageModelsToReduce.size > 0;
        }
    }
}
