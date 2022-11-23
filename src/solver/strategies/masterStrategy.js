import { findAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { findAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSumsStrategy';
import { initPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { placeNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { reducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { reflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export const masterStrategy = (ctx) => {
    const model = ctx.model;

    findAndSliceResidualSumsStrategy(ctx);
    initPermsForCagesStrategy(ctx);

    do {
        reducePermsInCagesStrategy(ctx);
        placeNumsForSingleOptionCellsStrategy(ctx);
        ctx.run(reflectSolvedCellsStrategy);
        findAndReduceCagePermsByHouseStrategy(ctx);
    }
    while (!model.isSolved && ctx.hasCageModelsToReevaluatePerms)
}
