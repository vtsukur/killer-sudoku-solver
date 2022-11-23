export class Context {
    #model;
    #cageSlicer;
    #cageModelsToReevaluatePerms;
    #recentlySolvedCellModels;

    constructor(model, cageSlicer) {
        this.#model = model;
        this.#cageSlicer = cageSlicer;
        this.#cageModelsToReevaluatePerms = undefined;
        this.#recentlySolvedCellModels = [];
    }
    
    get model() {
        return this.#model;
    }

    get cageSlicer() {
        return this.#cageSlicer;
    }

    get hasCageModelsToReevaluatePerms() {
        return this.#cageModelsToReevaluatePerms !== undefined;
    }

    get cageModelsToReevaluatePerms() {
        return this.#cageModelsToReevaluatePerms;
    }

    set cageModelsToReevaluatePerms(value) {
        this.#cageModelsToReevaluatePerms = value;
    }

    clearCageModelsToReevaluatePerms() {
        this.#cageModelsToReevaluatePerms = undefined;
    }

    get hasRecentlySolvedCellModels() {
        return this.#recentlySolvedCellModels.length > 0;
    }

    get recentlySolvedCellModels() {
        return this.#recentlySolvedCellModels;
    }

    set recentlySolvedCellModels(value) {
        this.#recentlySolvedCellModels = value;
    }

    clearRecentlySolvedCellModels() {
        this.#cageModelsToReevaluatePerms = [];
    }
}
