import { Context } from '../context';
import { reduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';
import { reduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { sliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export function reflectSolvedCellsStrategy(this: Context) {
    if (this.hasRecentlySolvedCellModels) {
        this.run(reduceCageNumOptsBySolvedCellsStrategy);
        this.run(reduceHousePermsBySolvedCellsStrategy);
        this.run(sliceCagesForSolvedCellsStrategy);
        this.clearRecentlySolvedCellModels();
        this.cageModelsToReevaluatePerms = Array.from(this.model.cageModelsMap.values());
    }
}
