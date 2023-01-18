import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { Context } from '../context';

export function reducePermsInCagesStrategy(this: Context) {
    let iterate = true;

    while (iterate) {
        let modifiedCellModels = new Set<CellModel>();

        for (const cageModel of this.cageModelsToReevaluatePerms as Array<CageModel>) {
            const currentlyModifiedCellModels = cageModel.reduce();
            modifiedCellModels = new Set([...modifiedCellModels, ...currentlyModifiedCellModels]);
        }

        let moreCageModelsToReduce = new Set<CageModel>();
        for (const modifiedCellModel of modifiedCellModels.values()) {
            moreCageModelsToReduce = new Set([...moreCageModelsToReduce, ...modifiedCellModel.withinCageModels]);
        }

        this.cageModelsToReevaluatePerms = Array.from(moreCageModelsToReduce.values());
        iterate = moreCageModelsToReduce.size > 0;
    }

    this.clearCageModelsToReevaluatePerms();
}
