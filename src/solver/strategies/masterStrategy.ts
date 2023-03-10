import { Strategy } from './strategy';
import { DeepTryOptionsStrategy } from './tactics/deepTryOptionsStrategy';
import { FindAndReduceCagePermsByHouseStrategy } from './tactics/findAndReduceCagePermsByHouseStrategy';
import { FindComplementingCagesStrategy } from './tactics/findComplementingCagesStrategy';
import { FindNonetBasedFormulasStrategy } from './tactics/findNonetBasedFormulasStrategy';
import { FindProtrusiveCagesStrategy } from './tactics/findProtrusiveCagesStrategy';
import { FindSameNumberOptsInSameCellsStrategy } from './tactics/findSameNumberOptsInSameCellsStrategy';
import { InitCagesCombosStrategy } from './tactics/initCagesCombosStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './tactics/placeNumsForSingleOptionCellsStrategy';
import { ReduceCellOptionsWhichInvalidateSingleComboStrategy } from './tactics/reduceCellOptionsWhichInvalidateSingleComboStrategy';
import { ReducePermsInCagesStrategy } from './tactics/reducePermsInCagesStrategy';
import { ReflectSolvedCellsStrategy } from './tactics/reflectSolvedCellsStrategy';

export class MasterStrategy extends Strategy {

    execute() {
        if (!this._context.skipInit) {
            this.executeAnother(FindProtrusiveCagesStrategy);
            this.executeAnother(FindComplementingCagesStrategy);
            this.executeAnother(InitCagesCombosStrategy);
        }

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
