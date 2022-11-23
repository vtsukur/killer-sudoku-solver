import { BaseStrategy } from './baseStrategy';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { FindAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSums';
import { InitPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './tactics/reduceHousePermsBySolvedCellsStrategy';
import { ReducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { SliceCagesForSolvedCellsStrategy } from './tactics/sliceCagesForSolvedCellsStrategy';

export class MasterStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    apply(ctx) {
        const model = ctx.model;

        new FindAndSliceResidualSumsStrategy().apply(ctx);
        new InitPermsForCagesStrategy().apply(ctx);

        let cageModelsIterable = model.cageModelsMap.values();
        let iterate = true;

        ctx.cageModelsToReevaluatePerms =model.cageModelsMap.values();

        while (iterate) {
            if (model.isSolved) {
                return;
            }

            new ReducePermsInCagesStrategy().apply(ctx);
    
            const solvedCellModels = new PlaceNumsForSingleOptionCellsStrategy().apply(ctx);
            new ReduceHousePermsBySolvedCellsStrategy(solvedCellModels).apply(ctx);

            let nextCagesSet = new Set();
            if (solvedCellModels.length > 0) {
                new SliceCagesForSolvedCellsStrategy(solvedCellModels).apply(ctx);
                nextCagesSet = new Set(model.cageModelsMap.values());
                cageModelsIterable = nextCagesSet.values();
            }

            if (nextCagesSet.size > 0) {
                cageModelsIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = new FindAndReduceCagePermsByHouseStrategy().apply(ctx);
                cageModelsIterable = nextCagesSet.values();
            }
            ctx.cageModelsToReevaluatePerms = nextCagesSet.values();

            iterate = nextCagesSet.size > 0;
        }

        return model.solution;
    }
}
