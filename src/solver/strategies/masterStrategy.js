import { BaseStrategy } from './baseStrategy';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { FindAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSums';
import { InitPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { ReducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { ReflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export class MasterStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    apply(ctx) {
        const model = ctx.model;

        new FindAndSliceResidualSumsStrategy().apply(ctx);
        new InitPermsForCagesStrategy().apply(ctx);

        ctx.cageModelsToReevaluatePerms = model.cageModelsMap.values();

        while (ctx.cageModelsToReevaluatePerms !== undefined) {
            if (model.isSolved) {
                return;
            }

            new ReducePermsInCagesStrategy().apply(ctx);
            new PlaceNumsForSingleOptionCellsStrategy().apply(ctx);
            new ReflectSolvedCellsStrategy().apply(ctx);
            new FindAndReduceCagePermsByHouseStrategy().apply(ctx);
        }

        return model.solution;
    }
}
