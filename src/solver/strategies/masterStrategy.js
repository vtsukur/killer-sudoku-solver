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
        let newlySolvedCellModels = [];

        ctx.setCageModelsToReevaluatePerms(model.cageModelsMap.values());

        while (iterate) {
            if (model.isSolved) {
                return;
            }

            new ReducePermsInCagesStrategy().apply(ctx);
    
            const solvedCellModels = new PlaceNumsForSingleOptionCellsStrategy().apply(ctx);
            let nextCagesSet = new ReduceHousePermsBySolvedCellsStrategy(solvedCellModels).apply(ctx);

            newlySolvedCellModels = newlySolvedCellModels.concat(Array.from(solvedCellModels));

            if (nextCagesSet.size > 0) {
                cageModelsIterable = nextCagesSet.values();
            } else if (newlySolvedCellModels.length > 0) {
                new SliceCagesForSolvedCellsStrategy(newlySolvedCellModels).apply(ctx);
                newlySolvedCellModels = [];
                nextCagesSet = new Set(model.cageModelsMap.values());
                cageModelsIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = new FindAndReduceCagePermsByHouseStrategy().apply(ctx);
                cageModelsIterable = nextCagesSet.values();
            }
            ctx.setCageModelsToReevaluatePerms(nextCagesSet.values());

            iterate = nextCagesSet.size > 0;
        }

        return model.solution;
    }
}
