import { Strategy } from '../strategy';
import { reduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';
import { reduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { sliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export class ReflectSolvedCellsStrategy extends Strategy {
    execute(): void {
        if (this._context.hasRecentlySolvedCellModels) {
            this.executeAnotherFn(reduceCageNumOptsBySolvedCellsStrategy);
            this.executeAnotherFn(reduceHousePermsBySolvedCellsStrategy);
            this.executeAnotherFn(sliceCagesForSolvedCellsStrategy);
            this._context.clearRecentlySolvedCellModels();
            this._context.cageModelsToReevaluatePerms = Array.from(this._model.cageModelsMap.values());
        }            
    }
}
