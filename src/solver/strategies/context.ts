import * as _ from 'lodash';
import { Sets } from '../../util/sets';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';
import { MasterModel } from '../models/masterModel';
import { CageSlicer } from '../transform/cageSlicer';
import { NumsReduction } from './numsReduction';

export class Context {

    readonly model;
    readonly cageSlicer;
    reduction = new NumsReduction();
    private _cageModelsToReduce = new Set<CageModel>();
    recentlySolvedCellModels: Array<CellModel>;
    depth;
    foundSolution?: Array<Array<number>>;
    skipInit = false;

    constructor(model: MasterModel) {
        this.model = model;
        this.cageSlicer = new CageSlicer(this);
        this.recentlySolvedCellModels = [];
        this.depth = 0;
        this.foundSolution = undefined;
    }

    get hasCageModelsToReduce() {
        return this._cageModelsToReduce.size > 0;
    }

    get cageModelsToReduce() {
        return this._cageModelsToReduce;
    }

    setReductionToAll() {
        this._cageModelsToReduce = new Set(this.model.cageModelsMap.values());
    }

    setReduction(reduction: NumsReduction) {
        this.reduction = reduction;
        this._cageModelsToReduce = new Set(reduction.impactedCageModels);
    }

    addToReduction(reduction: NumsReduction) {
        Sets.U(this._cageModelsToReduce, reduction.impactedCageModels);
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
