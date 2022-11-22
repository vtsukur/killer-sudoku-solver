import { BaseStrategy } from './baseStrategy';

export class BaseModelStrategy extends BaseStrategy {
    #model;

    constructor(model) {
        this.#model = model;
    }

    get model() {
        return this.#model;
    }
}
