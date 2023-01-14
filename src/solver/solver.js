import { MasterModel } from './models/masterModel';
import { Context } from './strategies/context';
import { masterStrategy } from './strategies/masterStrategy';
import { CageSlicer } from './transform/cageSlicer';
import { Solution } from '../puzzle/solution';

export class Solver {
    #model;

    constructor(puzzle) {
        this.#model = new MasterModel(puzzle);
    }

    solve() {
        const ctx = new Context(this.#model, new CageSlicer(this.#model));
        ctx.run(masterStrategy);
        return new Solution(this.#model.solution);
    }

    get model() {
        return this.#model;
    }
}
