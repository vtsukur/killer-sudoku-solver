import _ from 'lodash';
import { CageSlicer } from '../transform/cageSlicer';

export class Context {
    #model;
    #cageSlicer;
    #cageModelsToReevaluatePerms;
    #recentlySolvedCellModels;
    #depth;
    #foundSolution;

    constructor(model, cageSlicer) {
        this.#model = model;
        this.#cageSlicer = cageSlicer;
        this.#cageModelsToReevaluatePerms = undefined;
        this.#recentlySolvedCellModels = [];
        this.#depth = 0;
        this.#foundSolution = undefined;
    }
    
    run(strategyFn) {
        if (!this.isSolutionFound) {
            strategyFn.apply(this);
        }
    }

    get model() {
        return this.#model;
    }

    get cageSlicer() {
        return this.#cageSlicer;
    }

    get hasCageModelsToReevaluatePerms() {
        return !_.isUndefined(this.#cageModelsToReevaluatePerms);
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

    get depth() {
        return this.#depth;
    }

    get isSolutionFound() {
        return !_.isUndefined(this.#foundSolution);
    }

    get foundSolution() {
        return this.#foundSolution;
    }

    set foundSolution(foundSolution) {
        this.#foundSolution = foundSolution;
    }

    deepCopyForDeepTry() {
        const modelCopy = this.#model.deepCopy();
        const cageSlicerCopy = new CageSlicer(modelCopy);
        const copy = new Context(modelCopy, cageSlicerCopy);
        copy.#depth = this.#depth + 1;
        return copy;
    }
}
