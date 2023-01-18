import { Puzzle } from '../puzzle/puzzle';
import { Solution } from '../puzzle/solution';
import { MasterModel } from './models/masterModel';
import { Context } from './strategies/context';
import { masterStrategy } from './strategies/masterStrategy';
import { CageSlicer } from './transform/cageSlicer';

export class Solver {
    readonly model;

    constructor(puzzle: Puzzle) {
        this.model = new MasterModel(puzzle);
    }

    solve() {
        const ctx = new Context(this.model, new CageSlicer(this.model));
        ctx.run(masterStrategy);
        return new Solution(this.model.solution);
    }
}
