import { BaseStrategy } from './baseStrategy';
import { Context } from './context';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { FindAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSums';
import { InitPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './tactics/reduceHousePermsBySolvedCellsStrategy';
import { ReducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { SliceCagesForSolvedCellsStrategy } from './tactics/sliceCagesForSolvedCellsStrategy';

export class MasterStrategy extends BaseStrategy {
    constructor(model) {
        super(model);
    }

    apply() {
        const ctx = new Context();

        new FindAndSliceResidualSumsStrategy(this.model).apply(ctx);
        new InitPermsForCagesStrategy(this.model).apply(ctx);

        let cageModelsIterable = this.model.cageModelsMap.values();
        let iterate = true;
        let newlySolvedCellModels = [];

        ctx.setCageModelsToReevaluatePerms(this.model.cageModelsMap.values());

        while (iterate) {
            if (this.model.isSolved) {
                return;
            }

            new ReducePermsInCagesStrategy(this.model).apply(ctx);
    
            const solvedCellModels = new PlaceNumsForSingleOptionCellsStrategy(this.model).apply(ctx);
            let nextCagesSet = new ReduceHousePermsBySolvedCellsStrategy(this.model, solvedCellModels).apply(ctx);

            newlySolvedCellModels = newlySolvedCellModels.concat(Array.from(solvedCellModels));

            if (nextCagesSet.size > 0) {
                cageModelsIterable = nextCagesSet.values();
            } else if (newlySolvedCellModels.length > 0) {
                new SliceCagesForSolvedCellsStrategy(this.model, newlySolvedCellModels).apply(ctx);
                newlySolvedCellModels = [];
                nextCagesSet = new Set(this.model.cageModelsMap.values());
                cageModelsIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = new FindAndReduceCagePermsByHouseStrategy(this.model).apply(ctx);
                cageModelsIterable = nextCagesSet.values();
            }
            ctx.setCageModelsToReevaluatePerms(nextCagesSet.values());

            iterate = nextCagesSet.size > 0;
        }

        return this.model.solution;
    }
}
