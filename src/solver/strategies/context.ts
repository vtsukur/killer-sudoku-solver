import * as _ from 'lodash';
import { CageModel } from '../models/elements/cageModel';
import { CellModel } from '../models/elements/cellModel';
import { MasterModel } from '../models/masterModel';
import { CageSlicer } from '../transform/cageSlicer';
import { ReducedCellModels } from './reducedCellModels';

export class Context {
    readonly model;
    readonly cageSlicer;
    reducedModels = new ReducedCellModels();
    private _cageModelsToTryReduceFor: ReadonlySet<CageModel> = new Set<CageModel>();
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

    get hasCageModelsToTryReduceFor() {
        return this._cageModelsToTryReduceFor.size > 0;
    }

    get cageModelsToTryReduceFor() {
        return this._cageModelsToTryReduceFor;
    }

    // to be removed
    set cageModelsToTryReduceFor(val: ReadonlySet<CageModel>) {
        this._cageModelsToTryReduceFor = val;
    }

    setCageModelsToTryReduceForBy(reducedCellMs: ReducedCellModels) {
        this._cageModelsToTryReduceFor = reducedCellMs.impactedCageModels;
    }

    // name & param to be changed to work with ReducedCellModels
    addCageModelsToTryReduceFor(cageMs: ReadonlySet<CageModel>) {
        this._cageModelsToTryReduceFor = new Set([...this._cageModelsToTryReduceFor, ...cageMs]);
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
