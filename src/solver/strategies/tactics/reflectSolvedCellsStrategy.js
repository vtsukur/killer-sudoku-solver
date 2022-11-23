import { reduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { sliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export const reflectSolvedCellsStrategy = (ctx) => {
    if (ctx.hasRecentlySolvedCellModels) {
        ctx.run(reduceHousePermsBySolvedCellsStrategy);
        sliceCagesForSolvedCellsStrategy(ctx);
        ctx.clearRecentlySolvedCellModels();
        ctx.cageModelsToReevaluatePerms = ctx.model.cageModelsMap.values();
    }
}
