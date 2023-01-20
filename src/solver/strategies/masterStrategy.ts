import { Strategy } from './strategy';
import { DeepTryOptionsStrategy } from './tactics/deepTryOptionsStrategy';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { FindAndSliceResidualSumsStrategy } from './tactics/findAndSliceResidualSumsStrategy';
import { findNonetBasedFormulasStrategy } from './tactics/findNonetBasedFormulasStrategy';
import { FindRedundantNonetSumsStrategy } from './tactics/findRedundantNonetSumsStrategy';
import { findSameNumberOptsInSameCellsStrategy } from './tactics/findSameNumberOptsInSameCellsStrategy';
import { initPermsForCagesStrategy } from './tactics/initPermsForCagesStrategy';
import { placeNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { reduceCellOptionsWhichInvalidateSingleComboStrategy } from './tactics/reduceCellOptionsWhichInvalidateSingleComboStrategy';
import { reducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { reflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export class MasterStrategy extends Strategy {
    execute() {
        if (!this._context.skipInit) {
            this.executeAnother(FindRedundantNonetSumsStrategy);
            this.executeAnother(FindAndSliceResidualSumsStrategy);
            this.executeAnotherFn(initPermsForCagesStrategy);    
        }
    
        do {
            this.executeAnotherFn(reducePermsInCagesStrategy);
            this.executeAnotherFn(placeNumsForSingleOptionCellsStrategy);
            this.executeAnotherFn(reflectSolvedCellsStrategy);
            this.executeAnother(FindAndReduceCagePermsByHouseStrategy);
            this.executeAnotherFn(reduceCellOptionsWhichInvalidateSingleComboStrategy);
            this.executeAnotherFn(findNonetBasedFormulasStrategy);
            this.executeAnotherFn(findSameNumberOptsInSameCellsStrategy);
            this.executeAnother(DeepTryOptionsStrategy);
        }
        while (!this._model.isSolved && this._context.hasCageModelsToReevaluatePerms);       
    }
}
