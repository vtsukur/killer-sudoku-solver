import { Puzzle } from '../puzzle/puzzle';
import { Solution } from '../puzzle/solution';
import { MasterModel } from './models/masterModel';
import { Context } from './strategies/context';
import { MasterStrategy } from './strategies/masterStrategy';
import { CageSlicer } from './transform/cageSlicer';

export class Solver {
    solve(puzzle: Puzzle) {
        const model = new MasterModel(puzzle);
        const ctx = new Context(model, new CageSlicer(model));
        new MasterStrategy(ctx).execute();
        return new Solution(model.solution);
    }
}
