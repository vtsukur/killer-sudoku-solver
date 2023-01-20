import * as _ from 'lodash';
import { ReducedCellModels } from '../reducedCellModels';
import { Strategy } from '../strategy';

export class ReduceCageNumOptsBySolvedCellsStrategy extends Strategy {
    execute() {
        const reducedCellMs = new ReducedCellModels();
        this._context.recentlySolvedCellModels.forEach(solvedCellM => {
            const num = solvedCellM.placedNum as number;
            for (const cageM of solvedCellM.withinCageModels) {
                if (cageM.canHaveDuplicateNums) continue;
    
                for (const cellM of cageM.cellMs) {
                    if (!_.isUndefined(cellM.placedNum)) continue;
        
                    if (cellM.hasNumOpt(num)) {
                        cellM.deleteNumOpt(num);
                        reducedCellMs.addOne(cellM);
                    }
                }    
            }
        });
        this._context.setCageModelsToTryReduceForBy(reducedCellMs);
    }
}
