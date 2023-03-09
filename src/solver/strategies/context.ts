import * as _ from 'lodash';
import { Sets } from '../../util/sets';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';
import { MasterModel } from '../models/masterModel';
import { CageSlicer } from '../transform/cageSlicer';
import { ReducedCellModels } from './reducedCellModels';

export class Context {

    readonly model;
    readonly cageSlicer;
    reducedModels = new ReducedCellModels();
    private _cageModelsToReduce = new Set<CageModel>();
    recentlySolvedCellModels: Array<CellModel>;
    depth;
    foundSolution?: Array<Array<number>>;
    skipInit = false;

    constructor(model: MasterModel, cageSlicer: CageSlicer) {
        this.model = model;
        this.cageSlicer = cageSlicer;
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

    setCageModelsToReduceToAll() {
        this._cageModelsToReduce = new Set(this.model.cageModelsMap.values());
    }

    setCageModelsToReduceFrom(reducedCellMs: ReducedCellModels) {
        this._cageModelsToReduce = new Set(reducedCellMs.impactedCageModels);
    }

    addCageModelsToReduceFrom(reducedCellMs: ReducedCellModels) {
        Sets.U(this._cageModelsToReduce, reducedCellMs.impactedCageModels);
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
        const cageSlicerCopy = new CageSlicer(modelCopy);
        const copy = new Context(modelCopy, cageSlicerCopy);
        copy.depth = this.depth + 1;
        return copy;
    }

}
