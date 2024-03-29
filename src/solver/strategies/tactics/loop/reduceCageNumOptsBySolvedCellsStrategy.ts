import * as _ from 'lodash';
import { Strategy } from '../../strategy';

export class ReduceCageNumOptsBySolvedCellsStrategy extends Strategy {

    execute() {
        this._context.recentlySolvedCellModels.forEach(solvedCellM => {
            const num = solvedCellM.placedNum as number;
            for (const cageM of solvedCellM.withinCageModels) {
                for (const cellM of cageM.cellMs) {
                    if (!_.isUndefined(cellM.placedNum)) continue;

                    this._context.reduction.tryDeleteNumOpt(cellM, num);
                }
            }
        });
    }

}
