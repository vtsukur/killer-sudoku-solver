import { Strategy } from '../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { SliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export class ReflectSolvedCellsStrategy extends Strategy {
    execute() {
        if (this._context.hasRecentlySolvedCellModels) {
            this.executeAnother(ReduceCageNumOptsBySolvedCellsStrategy);
            this.executeAnother(ReduceHousePermsBySolvedCellsStrategy);
            this.executeAnother(SliceCagesForSolvedCellsStrategy);
            this._context.clearRecentlySolvedCellModels();
            this._context.cageModelsToReevaluatePerms = Array.from(this._model.cageModelsMap.values());
        }            
    }
}
