import { BaseStrategy } from '../baseStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './reduceHousePermsBySolvedCellsStrategy';
import { SliceCagesForSolvedCellsStrategy } from './sliceCagesForSolvedCellsStrategy';

export class ReflectSolvedCellsStrategy extends BaseStrategy {
    #solvedCellModels;

    constructor(solvedCellModels) {
        super();
        this.#solvedCellModels = solvedCellModels;
    }

    apply(ctx) {
        new ReduceHousePermsBySolvedCellsStrategy(this.#solvedCellModels).apply(ctx);
        new SliceCagesForSolvedCellsStrategy(this.#solvedCellModels).apply(ctx);
    }
}
