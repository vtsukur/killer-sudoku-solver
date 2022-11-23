import _ from 'lodash';
import { MasterModel } from './models/masterModel';
import { MasterStrategy } from './strategies/masterStrategy';

export class PuzzleSolver {
    #model;
    #masterStrategy;

    constructor(problem) {
        this.#model = new MasterModel(problem);
        this.#masterStrategy = new MasterStrategy(this.#model);
    }

    solve() {
        this.#masterStrategy.apply();

        return this.#model.solution;
    }

    get model() {
        return this.#model;
    }
}
