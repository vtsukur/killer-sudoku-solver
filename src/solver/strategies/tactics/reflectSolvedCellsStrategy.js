import { reduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { sliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export const reflectSolvedCellsStrategy = (ctx) => {
    if (ctx.hasRecentlySolvedCellModels) {
        ctx.run(reduceHousePermsBySolvedCellsStrategy);
        ctx.run(sliceCagesForSolvedCellsStrategy);
        ctx.clearRecentlySolvedCellModels();
        ctx.cageModelsToReevaluatePerms = ctx.model.cageModelsMap.values();
    }
}
