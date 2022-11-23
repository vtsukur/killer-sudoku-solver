export class BaseStrategy {
    #model;

    constructor(model) {
        this.#model = model;
    }

    get model() {
        return this.#model;
    }
    
    apply() {}
}
