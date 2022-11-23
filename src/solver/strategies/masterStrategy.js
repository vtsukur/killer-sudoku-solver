import { findAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { findAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSumsStrategy';
import { initPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { placeNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { reducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { reflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export const masterStrategy = (ctx) => {
    const model = ctx.model;

    ctx.run(findAndSliceResidualSumsStrategy);
    ctx.run(initPermsForCagesStrategy);

    do {
        ctx.run(reducePermsInCagesStrategy);
        ctx.run(placeNumsForSingleOptionCellsStrategy);
        ctx.run(reflectSolvedCellsStrategy);
        ctx.run(findAndReduceCagePermsByHouseStrategy);
    }
    while (!model.isSolved && ctx.hasCageModelsToReevaluatePerms)
}
