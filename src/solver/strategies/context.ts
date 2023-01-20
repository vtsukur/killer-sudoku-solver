import * as _ from 'lodash';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';
import { MasterModel } from '../models/masterModel';
import { CageSlicer } from '../transform/cageSlicer';

export class Context {
    readonly model;
    readonly cageSlicer;
    cageModelsToReevaluatePerms?: Array<CageModel>;
    recentlySolvedCellModels: Array<CellModel>;
    depth;
    foundSolution?: Array<Array<number>>;
    skipInit = false;

    constructor(model: MasterModel, cageSlicer: CageSlicer) {
        this.model = model;
        this.cageSlicer = cageSlicer;
        this.cageModelsToReevaluatePerms = undefined;
        this.recentlySolvedCellModels = [];
        this.depth = 0;
        this.foundSolution = undefined;
    }
    
    run(strategyFn: () => void) {
        if (!this.isSolutionFound) {
            strategyFn.apply(this);
        }
    }

    get hasModelsTouchedByReduction() {
        return !_.isUndefined(this.cageModelsToReevaluatePerms);
    }

    clearCageModelsToReevaluatePerms() {
        this.cageModelsToReevaluatePerms = undefined;
    }

    get hasRecentlySolvedCellModels() {
        return this.recentlySolvedCellModels.length > 0;
    }

    clearRecentlySolvedCellModels() {
        this.cageModelsToReevaluatePerms = [];
    }

    get isSolutionFound() {
        return !_.isUndefined(this.foundSolution);
    }

    deepCopyForDeepTry() {
        const modelCopy = this.model.deepCopy();
        const cageSlicerCopy = new CageSlicer(modelCopy);
        const copy = new Context(modelCopy, cageSlicerCopy);
        copy.depth = this.depth + 1;
        return copy;
    }
}
