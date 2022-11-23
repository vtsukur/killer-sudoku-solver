import { CageSlicer } from '../transform/cageSlicer';
import { Context } from './context';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { FindAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSums';
import { InitPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './tactics/reduceHousePermsBySolvedCellsStrategy';
import { ReducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { SliceCagesForSolvedCellsStrategy } from './tactics/sliceCagesForSolvedCellsStrategy';

export class MasterStrategy {
    #model;
    #cageSlicer;

    constructor(model) {
        this.#model = model;
        this.#cageSlicer = new CageSlicer(model);
    }

    apply() {
        const ctx = new Context(this.#model);

        new FindAndSliceResidualSumsStrategy(this.#cageSlicer).apply(ctx);
        new InitPermsForCagesStrategy().apply(ctx);

        let cageModelsIterable = this.#model.cageModelsMap.values();
        let iterate = true;
        let newlySolvedCellModels = [];

        ctx.setCageModelsToReevaluatePerms(this.#model.cageModelsMap.values());

        while (iterate) {
            if (this.#model.isSolved) {
                return;
            }

            new ReducePermsInCagesStrategy().apply(ctx);
    
            const solvedCellModels = new PlaceNumsForSingleOptionCellsStrategy().apply(ctx);
            let nextCagesSet = new ReduceHousePermsBySolvedCellsStrategy(solvedCellModels).apply(ctx);

            newlySolvedCellModels = newlySolvedCellModels.concat(Array.from(solvedCellModels));

            if (nextCagesSet.size > 0) {
                cageModelsIterable = nextCagesSet.values();
            } else if (newlySolvedCellModels.length > 0) {
                new SliceCagesForSolvedCellsStrategy(this.#cageSlicer, newlySolvedCellModels).apply(ctx);
                newlySolvedCellModels = [];
                nextCagesSet = new Set(this.#model.cageModelsMap.values());
                cageModelsIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = new FindAndReduceCagePermsByHouseStrategy().apply(ctx);
                cageModelsIterable = nextCagesSet.values();
            }
            ctx.setCageModelsToReevaluatePerms(nextCagesSet.values());

            iterate = nextCagesSet.size > 0;
        }

        return this.#model.solution;
    }
}
