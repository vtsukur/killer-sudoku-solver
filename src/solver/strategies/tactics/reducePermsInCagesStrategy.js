export function reducePermsInCagesStrategy() {
    let iterate = true;

    while (iterate) {
        let modifiedCellModels = new Set();

        for (const cageModel of this.cageModelsToReevaluatePerms) {
            const currentlyModifiedCellModels = cageModel.reduce();
            // if (currentlyModifiedCellModels.size > 0 && cageModel.comboCount === 1 && cageModel.isWithinHouse) {
            //     this.addCageModelToReflectHouseReduction
            // }
            modifiedCellModels = new Set([...modifiedCellModels, ...currentlyModifiedCellModels]);
        }

        let moreCageModelsToReduce = new Set();
        for (const modifiedCellModel of modifiedCellModels.values()) {
            moreCageModelsToReduce = new Set([...moreCageModelsToReduce, ...modifiedCellModel.withinCageModels]);
        }

        this.cageModelsToReevaluatePerms = moreCageModelsToReduce.values();
        iterate = moreCageModelsToReduce.size > 0;
    }

    this.clearCageModelsToReevaluatePerms();
}
