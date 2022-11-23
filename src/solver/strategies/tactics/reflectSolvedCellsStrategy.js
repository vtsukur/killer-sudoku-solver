import { BaseStrategy } from '../baseStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { SliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export class ReflectSolvedCellsStrategy extends BaseStrategy {
    #solvedCellModels;

    constructor(solvedCellModels) {
        super();
        this.#solvedCellModels = solvedCellModels;
    }

    apply(ctx) {
        if (ctx.hasRecentlySolvedCellModels) {
            new ReduceHousePermsBySolvedCellsStrategy(ctx.recentlySolvedCellModels).apply(ctx);
            new SliceCagesForSolvedCellsStrategy(ctx.recentlySolvedCellModels).apply(ctx);
            ctx.clearRecentlySolvedCellModels();
            ctx.cageModelsToReevaluatePerms = ctx.model.cageModelsMap.values();
        }
    }
}
