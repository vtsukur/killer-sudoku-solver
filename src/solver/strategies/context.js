export class Context {
    #cageModelsToReevaluatePerms;
    #model;

    constructor(model) {
        this.#model = model;
        this.#cageModelsToReevaluatePerms = new Set();
    }
    
    get model() {
        return this.#model;
    }

    get cageModelsToReevaluatePerms() {
        return this.#cageModelsToReevaluatePerms;
    }

    setCageModelsToReevaluatePerms(cageModelsToReevaluatePerms) {
        this.#cageModelsToReevaluatePerms = cageModelsToReevaluatePerms;
    }
}
