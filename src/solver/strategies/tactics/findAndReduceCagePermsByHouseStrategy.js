import _ from 'lodash';
import { House } from '../../../problem/house';
import { BaseStrategy } from '../baseStrategy';

export class FindAndReduceCagePermsByHouseStrategy extends BaseStrategy {
    constructor(model) {
        super(model);
    }

    apply() {
        let cageModelsToReduce = new Set();

        this.model.houseSolvers.forEach(houseSolver => {
            _.range(1, House.SIZE + 1).forEach(num => {
                const cageModelsWithNum = [];
                // consider overlapping vs non-overlapping cages
                houseSolver.cages.forEach(cage => {
                    if (this.model.cageModelsMap.get(cage.key).isSingleCellCage) return;
                    const cageModel = this.model.cageModelsMap.get(cage.key);
                    const hasNumInCells = cageModel.cellModels.some(cellModel => cellModel.hasNumOpt(num));
                    if (hasNumInCells) {
                        cageModelsWithNum.push(cageModel);
                    }
                });
                if (cageModelsWithNum.length !== 1) return;

                const cageModelToReDefine = cageModelsWithNum[0];
                const reducedCellModels = cageModelToReDefine.reduceToCombinationsContaining(num);
                
                if (!reducedCellModels.length) return;
                reducedCellModels.forEach(cellModel => {
                    cageModelsToReduce = new Set([...cageModelsToReduce, ...cellModel.withinCageSolvers]);
                });
            });
        });

        return cageModelsToReduce;
    }
}
