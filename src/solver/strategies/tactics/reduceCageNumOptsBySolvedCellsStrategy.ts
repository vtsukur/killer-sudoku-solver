import * as _ from 'lodash';
import { Context } from '../context';

export function reduceCageNumOptsBySolvedCellsStrategy(this: Context) {
    let cageModelsToReduceSet = new Set();
    this.recentlySolvedCellModels.forEach(solvedCellM => {
        const num = solvedCellM.placedNum as number;
        for (const cageModel of solvedCellM.withinCageModels) {
            if (cageModel.canHaveDuplicateNums) continue;

            for (const cellM of cageModel.cellMs) {
                if (!_.isUndefined(cellM.placedNum)) continue;
    
                if (cellM.hasNumOpt(num)) {
                    cellM.deleteNumOpt(num);
                    cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...cellM.withinCageModels]);
                }
            }    
        }
    });
    return cageModelsToReduceSet;
}
