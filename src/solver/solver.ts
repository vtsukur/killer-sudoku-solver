import { Puzzle } from '../puzzle/puzzle';
import { Solution } from '../puzzle/solution';
import { MasterModel } from './models/masterModel';
import { Context } from './strategies/context';
import { MasterStrategy } from './strategies/masterStrategy';
import { CageSlicer } from './transform/cageSlicer';

export class Solver {
    readonly model;

    constructor(puzzle: Puzzle) {
        this.model = new MasterModel(puzzle);
    }

    solve() {
        const ctx = new Context(this.model, new CageSlicer(this.model));
        new MasterStrategy(ctx).execute();
        return new Solution(this.model.solution);
    }
}
