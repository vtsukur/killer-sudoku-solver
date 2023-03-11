import { Strategy } from './strategy';
import { DeepTryOptionsStrategy } from './tactics/deepTryOptionsStrategy';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { FindNonetBasedFormulasStrategy } from './tactics/findNonetBasedFormulasStrategy';
import { FindSameNumberOptsInSameCellsStrategy } from './tactics/findSameNumberOptsInSameCellsStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { ReduceCellOptionsWhichInvalidateSingleComboStrategy } from './tactics/reduceCellOptionsWhichInvalidateSingleComboStrategy';
import { ReducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { ReflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';
import { MasterInitStrategy } from './tactics/init/masterInitStrategy';

export class MasterStrategy extends Strategy {

    execute() {
        this.executeAnother(MasterInitStrategy);

        do {
            this.executeAnother(ReducePermsInCagesStrategy);
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
