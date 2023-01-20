import * as _ from 'lodash';
import { Strategy } from '../strategy';

export class ReduceCageNumOptsBySolvedCellsStrategy extends Strategy {
    execute() {
        let cageMsToReduceSet = new Set();
        this._context.recentlySolvedCellModels.forEach(solvedCellM => {
            const num = solvedCellM.placedNum as number;
            for (const cageM of solvedCellM.withinCageModels) {
                if (cageM.canHaveDuplicateNums) continue;
    
                for (const cellM of cageM.cellMs) {
                    if (!_.isUndefined(cellM.placedNum)) continue;
        
                    if (cellM.hasNumOpt(num)) {
                        cellM.deleteNumOpt(num);
                        cageMsToReduceSet = new Set([...cageMsToReduceSet, ...cellM.withinCageModels]);
                    }
                }    
            }
        });
        return cageMsToReduceSet;
    }
}
