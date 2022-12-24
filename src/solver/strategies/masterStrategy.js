import { findAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { findAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSumsStrategy';
import { findNonetBasedFormulasStrategy } from './tactics/findNonetBasedFormulasStrategy';
import { findRedundantNonetSumsStrategy } from './tactics/findRedundantNonetSumsStrategy';
import { findSameNumberOptsInSameCellsStrategy } from './tactics/findSameNumberOptsInSameCellsStrategy';
import { initPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { placeNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { reduceCellOptionsWhichInvalidateSingleComboStrategy } from './tactics/reduceCellOptionsWhichInvalidateSingleComboStrategy';
import { reducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { reflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export function masterStrategy() {
    this.run(findRedundantNonetSumsStrategy);
    this.run(findAndSliceResidualSumsStrategy);
    this.run(initPermsForCagesStrategy);

    do {
        this.run(reducePermsInCagesStrategy);
        this.run(placeNumsForSingleOptionCellsStrategy);
        this.run(reflectSolvedCellsStrategy);
        this.run(findAndReduceCagePermsByHouseStrategy);
        this.run(reduceCellOptionsWhichInvalidateSingleComboStrategy);
        this.run(findNonetBasedFormulasStrategy);
        this.run(findSameNumberOptsInSameCellsStrategy);
    }
    while (!this.model.isSolved && this.hasCageModelsToReevaluatePerms)
}
