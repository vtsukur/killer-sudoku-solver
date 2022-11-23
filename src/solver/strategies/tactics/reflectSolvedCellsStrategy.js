import { reduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { SliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export const reflectSolvedCellsStrategy = (ctx) => {
    if (ctx.hasRecentlySolvedCellModels) {
        reduceHousePermsBySolvedCellsStrategy(ctx);
        new SliceCagesForSolvedCellsStrategy(ctx.recentlySolvedCellModels).apply(ctx);
        ctx.clearRecentlySolvedCellModels();
        ctx.cageModelsToReevaluatePerms = ctx.model.cageModelsMap.values();
    }
}
