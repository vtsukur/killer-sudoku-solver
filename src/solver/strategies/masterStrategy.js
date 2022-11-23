import { BaseStrategy } from './baseStrategy';
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
        new FindAndSliceResidualSumsStrategy(this.model).apply();
        new InitPermsForCagesStrategy(this.model).apply();

        let cageModelsIterable = this.model.cageModelsMap.values();
        let iterate = true;
        let newlySolvedCellModels = [];

        while (iterate) {
            if (this.model.placedNumCount >= 81) {
                return;
            }
    
            new ReducePermsInCagesStrategy(this.model, cageModelsIterable).apply();
    
            const solvedCellModels = new PlaceNumsForSingleOptionCellsStrategy(this.model).apply();
            let nextCagesSet = new ReduceHousePermsBySolvedCellsStrategy(this.model, solvedCellModels).apply();

            newlySolvedCellModels = newlySolvedCellModels.concat(Array.from(solvedCellModels));

            if (nextCagesSet.size > 0) {
                cageModelsIterable = nextCagesSet.values();
            } else if (newlySolvedCellModels.length > 0) {
                new SliceCagesForSolvedCellsStrategy(this.model, newlySolvedCellModels).apply();
                newlySolvedCellModels = [];
                nextCagesSet = new Set(this.model.cageModelsMap.values());
                cageModelsIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = new FindAndReduceCagePermsByHouseStrategy(this.model).apply();
                cageModelsIterable = nextCagesSet.values();
            }

            iterate = nextCagesSet.size > 0;
        }

        return this.model.solution;
    }
}
