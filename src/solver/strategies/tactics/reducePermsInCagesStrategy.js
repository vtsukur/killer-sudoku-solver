import { BaseStrategy } from '../baseStrategy';

export class ReducePermsInCagesStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    apply(ctx) {
        let iterate = true;

        while (iterate) {
            let modifiedCellModels = new Set();

            for (const cageModel of ctx.cageModelsToReevaluatePerms) {
                const currentlyModifiedCellModels = cageModel.reduce();
                modifiedCellModels = new Set([...modifiedCellModels, ...currentlyModifiedCellModels]);
            }

            let moreCageModelsToReduce = new Set();
            for (const modifiedCellModel of modifiedCellModels.values()) {
                moreCageModelsToReduce = new Set([...moreCageModelsToReduce, ...modifiedCellModel.withinCageModels]);
            }

            ctx.cageModelsToReevaluatePerms = moreCageModelsToReduce.values();
            iterate = moreCageModelsToReduce.size > 0;
        }

        ctx.clearCageModelsToReevaluatePerms();
    }
}
