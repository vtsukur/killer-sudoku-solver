export class Context {
    #model;
    #cageSlicer;
    #cageModelsToReevaluatePerms;

    constructor(model, cageSlicer) {
        this.#model = model;
        this.#cageSlicer = cageSlicer;
        this.#cageModelsToReevaluatePerms = new Set();
    }
    
    get model() {
        return this.#model;
    }

    get cageSlicer() {
        return this.#cageSlicer;
    }

    get cageModelsToReevaluatePerms() {
        return this.#cageModelsToReevaluatePerms;
    }

    set cageModelsToReevaluatePerms(value) {
        this.#cageModelsToReevaluatePerms = value;
    }
}
