import * as _ from 'lodash';
import { CellModel } from '../models/elements/cellModel';
import { MasterModel } from '../models/masterModel';
import { CageSlicer } from '../transform/cageSlicer';
import { NumsReduction } from './numsReduction';

export class Context {

    readonly model;
    readonly cageSlicer;
    reduction: NumsReduction;
    recentlySolvedCellModels: Array<CellModel>;
    depth;
    foundSolution?: Array<Array<number>>;
    skipInit = false;

    constructor(model: MasterModel, reduction: NumsReduction) {
        this.model = model;
        this.reduction = reduction;
        this.cageSlicer = new CageSlicer(this);
        this.recentlySolvedCellModels = [];
        this.depth = 0;
        this.foundSolution = undefined;
    }

    resetReduction(reduction: NumsReduction) {
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
        const copy = new Context(modelCopy, new NumsReduction());
        copy.depth = this.depth + 1;
        return copy;
    }

}
