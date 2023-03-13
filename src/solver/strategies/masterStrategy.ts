import { Strategy } from './strategy';
import { MasterInitStrategy } from './tactics/init';
import { DeepTryOptionsStrategy } from './tactics/loop/deepTryOptionsStrategy';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/loop/findAndReduceCagePermsByHouseStrategy';
import { FindNonetBasedFormulasStrategy } from './tactics/loop/findNonetBasedFormulasStrategy';
import { FindSameNumberOptsInSameCellsStrategy } from './tactics/loop/findSameNumberOptsInSameCellsStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/loop/placeNumsForSingleOptionCellsStrategy';
import { ReduceCellOptionsWhichInvalidateSingleComboStrategy } from './tactics/loop/reduceCellOptionsWhichInvalidateSingleComboStrategy';
import { ReducePermsForCagesStrategy } from './tactics/loop/reducePermsForCagesStrategy';
import { ReflectSolvedCellsStrategy } from './tactics/loop/reflectSolvedCellsStrategy';

export class MasterStrategy extends Strategy {

    execute() {
        this.executeAnother(MasterInitStrategy);

        do {
            this.executeAnother(ReducePermsForCagesStrategy);
            this.executeAnother(PlaceNumsForSingleOptionCellsStrategy);
            this.executeAnother(ReflectSolvedCellsStrategy);
            this.executeAnother(FindAndReduceCagePermsByHouseStrategy);
            this.executeAnother(ReduceCellOptionsWhichInvalidateSingleComboStrategy);
            this.executeAnother(FindNonetBasedFormulasStrategy);
            this.executeAnother(FindSameNumberOptsInSameCellsStrategy);
            this.executeAnother(DeepTryOptionsStrategy);
        }
        while (!this._model.isSolved && this._context.hasCageModelsToReduce);
    }

}
