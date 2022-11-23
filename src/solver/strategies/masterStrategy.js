import { BaseStrategy } from './baseStrategy';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { findAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSumsStrategy';
import { initPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { ReducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { ReflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export class MasterStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    apply(ctx) {
        const model = ctx.model;

        findAndSliceResidualSumsStrategy(ctx);
        initPermsForCagesStrategy(ctx);

        do {
            new ReducePermsInCagesStrategy().apply(ctx);
            new PlaceNumsForSingleOptionCellsStrategy().apply(ctx);
            new ReflectSolvedCellsStrategy().apply(ctx);
            new FindAndReduceCagePermsByHouseStrategy().apply(ctx);
        }
        while (!model.isSolved && ctx.hasCageModelsToReevaluatePerms)
    }
}
