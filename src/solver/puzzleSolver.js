import _ from 'lodash';
import { MasterModel } from './models/masterModel';
import { Context } from './strategies/context';
import { MasterStrategy } from './strategies/masterStrategy';
import { CageSlicer } from './transform/cageSlicer';

export class PuzzleSolver {
    #model;
    #masterStrategy;

    constructor(problem) {
        this.#model = new MasterModel(problem);
        this.#masterStrategy = new MasterStrategy();
    }

    solve() {
        const ctx = new Context(this.#model, new CageSlicer(this.#model));

        this.#masterStrategy.apply(ctx);

        return this.#model.solution;
    }

    get model() {
        return this.#model;
    }
}
