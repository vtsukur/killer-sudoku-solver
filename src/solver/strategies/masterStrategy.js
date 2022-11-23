import { BaseModelStrategy } from './tactics/baseModelStrategy';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { FindAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSums';
import { InitPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './tactics/reduceHousePermsBySolvedCellsStrategy';
import { ReducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { SliceCagesForSolvedCellsStrategy } from './tactics/sliceCagesForSolvedCellsStrategy';

export class MasterStrategy extends BaseModelStrategy {
    constructor(model) {
        super(model);
    }

    apply() {
        new FindAndSliceResidualSumsStrategy(this.model).apply();
        new InitPermsForCagesStrategy(this.model).apply();

        let cageSolversIterable = this.model.cagesSolversMap.values();
        let iterate = true;
        let newlySolvedCellDets = [];

        while (iterate) {
            if (this.model.placedNumCount >= 81) {
                return;
            }
    
            new ReducePermsInCagesStrategy(cageSolversIterable).apply();
    
            const solvedCellDets = new PlaceNumsForSingleOptionCellsStrategy(this.model).apply();
            let nextCagesSet = new ReduceHousePermsBySolvedCellsStrategy(this.model, solvedCellDets).apply();

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextCagesSet.size > 0) {
                cageSolversIterable = nextCagesSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                new SliceCagesForSolvedCellsStrategy(this.model, newlySolvedCellDets).apply();
                newlySolvedCellDets = [];
                nextCagesSet = new Set(this.model.cagesSolversMap.values());
                cageSolversIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = new FindAndReduceCagePermsByHouseStrategy(this.model).apply();
                cageSolversIterable = nextCagesSet.values();
            }

            iterate = nextCagesSet.size > 0;
        }

        return this.model.solution;
    }
}
