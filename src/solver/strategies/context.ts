import * as _ from 'lodash';
import { CellModel } from '../models/elements/cellModel';
import { MasterModel } from '../models/masterModel';
import { CageSlicer } from '../transform/cageSlicer';
import { MasterModelReduction } from './reduction/masterModelReduction';

export class Context {

    readonly model;
    readonly cageSlicer;
    reduction: MasterModelReduction;
    recentlySolvedCellModels: Array<CellModel>;
    depth;
    foundSolution?: Array<Array<number>>;
    skipInit = false;

    constructor(model: MasterModel) {
        this.model = model;
        this.reduction = new MasterModelReduction();
        this.cageSlicer = new CageSlicer(this);
        this.recentlySolvedCellModels = [];
        this.depth = 0;
        this.foundSolution = undefined;
    }

    resetReduction(reduction: MasterModelReduction) {
        this.reduction = reduction;
    }

    get hasRecentlySolvedCellModels() {
        return this.recentlySolvedCellModels.length > 0;
    }

    clearRecentlySolvedCellModels() {
        this.recentlySolvedCellModels = [];
    }

    get isSolutionFound() {
        return !_.isUndefined(this.foundSolution);
    }

    deepCopyForDeepTry() {
        const modelCopy = this.model.deepCopy();
        const copy = new Context(modelCopy);
        copy.depth = this.depth + 1;
        return copy;
    }

}
