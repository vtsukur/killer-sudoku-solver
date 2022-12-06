import { reduceCageNumOptsBySolvedCellsStrategy } from './reduceCageNumOptsBySolvedCellsStrategy';
import { reduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { sliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export function reflectSolvedCellsStrategy() {
    if (this.hasRecentlySolvedCellModels) {
        this.run(reduceCageNumOptsBySolvedCellsStrategy);
        this.run(reduceHousePermsBySolvedCellsStrategy);
        this.run(sliceCagesForSolvedCellsStrategy);
        this.clearRecentlySolvedCellModels();
        this.cageModelsToReevaluatePerms = this.model.cageModelsMap.values();
    }
}
