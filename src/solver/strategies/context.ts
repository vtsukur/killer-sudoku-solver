import * as _ from 'lodash';
import { MutableSet } from '../../util/mutableSet';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';
import { MasterModel } from '../models/masterModel';
import { CageSlicer } from '../transform/cageSlicer';
import { ReducedCellModels } from './reducedCellModels';

export class Context {
    readonly model;
    readonly cageSlicer;
    reducedModels = new ReducedCellModels();
    private _cageModelsToReduce = new MutableSet<CageModel>();
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

    run(strategyFn: () => void) {
        if (!this.isSolutionFound) {
            strategyFn.apply(this);
        }
    }

    get hasCageModelsToReduce() {
        return this._cageModelsToReduce.size > 0;
    }

    get cageModelsToReduce() {
        return this._cageModelsToReduce;
    }

    setCageModelsToReduceToAll() {
        this._cageModelsToReduce = new MutableSet(this.model.cageModelsMap.values());
    }

    setCageModelsToReduceFrom(reducedCellMs: ReducedCellModels) {
        this._cageModelsToReduce = new MutableSet(reducedCellMs.impactedCageModels);
    }

    addCageModelsToReduceFrom(reducedCellMs: ReducedCellModels) {
        this._cageModelsToReduce.addCollection(reducedCellMs.impactedCageModels);
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
