import * as _ from 'lodash';
import { NumsReduction } from '../../numsReduction';
import { Strategy } from '../../strategy';

export class ReduceCageNumOptsBySolvedCellsStrategy extends Strategy {

    execute() {
        const reducedCellMs = new NumsReduction();
        this._context.recentlySolvedCellModels.forEach(solvedCellM => {
            const num = solvedCellM.placedNum as number;
            for (const cageM of solvedCellM.withinCageModels) {
                for (const cellM of cageM.cellMs) {
                    if (!_.isUndefined(cellM.placedNum)) continue;

                    if (cellM.hasNumOpt(num)) {
                        cellM.deleteNumOpt(num);
                        reducedCellMs.addOne(cellM);
                    }
                }
            }
        });
        this._context.setCageModelsToReduceFrom(reducedCellMs);
    }

}
