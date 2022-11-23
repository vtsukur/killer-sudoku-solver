import _ from 'lodash';
import { House } from '../../../problem/house';
import { BaseStrategy } from './baseStrategy';

export class FindAndReduceCagePermsByHouseStrategy extends BaseStrategy {
    constructor(model) {
        super(model);
    }

    apply() {
        let cageSolversToReduce = new Set();

        this.model.houseSolvers.forEach(houseSolver => {
            _.range(1, House.SIZE + 1).forEach(num => {
                const cageSolversWithNum = [];
                // consider overlapping vs non-overlapping cages
                houseSolver.cages.forEach(cage => {
                    if (this.model.cagesSolversMap.get(cage.key).isSingleCellCage) return;
                    const cageSolver = this.model.cagesSolversMap.get(cage.key);
                    const hasNumInCells = cageSolver.cellSolvers.some(cellSolver => cellSolver.hasNumOpt(num));
                    if (hasNumInCells) {
                        cageSolversWithNum.push(cageSolver);
                    }
                });
                if (cageSolversWithNum.length !== 1) return;

                const cageSolverToReDefine = cageSolversWithNum[0];
                const reducedCellDets = cageSolverToReDefine.reduceToCombinationsContaining(num);
                
                if (!reducedCellDets.length) return;
                reducedCellDets.forEach(cellSolver => {
                    cageSolversToReduce = new Set([...cageSolversToReduce, ...cellSolver.withinCageSolvers]);
                });
            });
        });

        return cageSolversToReduce;
    }
}
