export class Context {
    #cageModelsToReevaluatePerms;

    constructor() {
        this.#cageModelsToReevaluatePerms = new Set();
    }
    
    get cageModelsToReevaluatePerms() {
        return this.#cageModelsToReevaluatePerms;
    }

    setCageModelsToReevaluatePerms(cageModelsToReevaluatePerms) {
        this.#cageModelsToReevaluatePerms = cageModelsToReevaluatePerms;
    }
}
