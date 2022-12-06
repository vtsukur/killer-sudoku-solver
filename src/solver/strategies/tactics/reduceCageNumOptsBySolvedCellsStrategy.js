import _ from 'lodash';

export function reduceCageNumOptsBySolvedCellsStrategy() {
    let cageModelsToReduceSet = new Set();
    this.recentlySolvedCellModels.forEach(solvedCellM => {
        const num = solvedCellM.placedNum;
        for (const cageModel of solvedCellM.withinCageModels) {
            if (cageModel.canHaveDuplicateNums) continue;

            for (const cellM of cageModel.cellModels) {
                if (!_.isUndefined(cellM.placedNum)) continue;
    
                if (cellM.hasNumOpt(num)) {
                    cellM.deleteNumOpt(num);
                    cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...cellM.withinCageModels]);
                }
            }    
        };
    });
    return cageModelsToReduceSet;
}
