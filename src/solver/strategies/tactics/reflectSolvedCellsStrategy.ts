import { Strategy } from '../strategy';
import { ReduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { sliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export class ReflectSolvedCellsStrategy extends Strategy {
    execute() {
        if (this._context.hasRecentlySolvedCellModels) {
            this.executeAnother(ReduceCageNumOptsBySolvedCellsStrategy);
            this.executeAnother(ReduceHousePermsBySolvedCellsStrategy);
            this.executeAnotherFn(sliceCagesForSolvedCellsStrategy);
            this._context.clearRecentlySolvedCellModels();
            this._context.cageModelsToReevaluatePerms = Array.from(this._model.cageModelsMap.values());
        }            
    }
}
