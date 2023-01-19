import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { Context } from '../context';

export function reducePermsInCagesStrategy(this: Context) {
    let iterate = true;

    while (iterate) {
        let modifiedCellMs = new Set<CellModel>();

        for (const cageModel of this.cageModelsToReevaluatePerms as Array<CageModel>) {
            const currentlyModifiedCellMs = cageModel.reduce();
            modifiedCellMs = new Set([...modifiedCellMs, ...currentlyModifiedCellMs]);
        }

        let moreCageModelsToReduce = new Set<CageModel>();
        for (const modifiedCellM of modifiedCellMs.values()) {
            moreCageModelsToReduce = new Set([...moreCageModelsToReduce, ...modifiedCellM.withinCageModels]);
        }

        this.cageModelsToReevaluatePerms = Array.from(moreCageModelsToReduce.values());
        iterate = moreCageModelsToReduce.size > 0;
    }

    this.clearCageModelsToReevaluatePerms();
}
