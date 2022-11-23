import { BaseStrategy } from './baseStrategy';
import { findAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { findAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSumsStrategy';
import { initPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { placeNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { reducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { reflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export class MasterStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    apply(ctx) {
        const model = ctx.model;

        findAndSliceResidualSumsStrategy(ctx);
        initPermsForCagesStrategy(ctx);

        do {
            reducePermsInCagesStrategy(ctx);
            placeNumsForSingleOptionCellsStrategy(ctx);
            reflectSolvedCellsStrategy(ctx);
            findAndReduceCagePermsByHouseStrategy(ctx);
        }
        while (!model.isSolved && ctx.hasCageModelsToReevaluatePerms)
    }
}
