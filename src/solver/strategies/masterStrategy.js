import { findAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { findAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSumsStrategy';
import { initPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { placeNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { reducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { reflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export function masterStrategy() {
    this.run(findAndSliceResidualSumsStrategy);
    this.run(initPermsForCagesStrategy);

    do {
        this.run(reducePermsInCagesStrategy);
        this.run(placeNumsForSingleOptionCellsStrategy);
        this.run(reflectSolvedCellsStrategy);
        this.run(findAndReduceCagePermsByHouseStrategy);
    }
    while (!this.model.isSolved && this.hasCageModelsToReevaluatePerms)
}
