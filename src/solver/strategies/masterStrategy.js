import { findAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { findAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSumsStrategy';
import { initPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { placeNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { reducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { reflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export const masterStrategy = (ctx) => {
    const model = ctx.model;

    ctx.run(findAndSliceResidualSumsStrategy);
    initPermsForCagesStrategy(ctx);

    do {
        reducePermsInCagesStrategy(ctx);
        placeNumsForSingleOptionCellsStrategy(ctx);
        ctx.run(reflectSolvedCellsStrategy);
        ctx.run(findAndReduceCagePermsByHouseStrategy);
    }
    while (!model.isSolved && ctx.hasCageModelsToReevaluatePerms)
}
