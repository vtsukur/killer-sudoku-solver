import _ from 'lodash';
import { House } from '../../../problem/house';
import { masterStrategy } from '../masterStrategy';

export function deepTryOptionsStrategy() {
    if (this.hasCageModelsToReevaluatePerms || this.model.solved) return;

    const cellMTargets = findCellMTargets(this.model);
    if (cellMTargets.length === 0) return;

    const cellMTarget = cellMTargets[0];

    for (const tryNum of cellMTarget.numOpts()) {
        const ctxCpy = this.deepCopy();
        const cellMTargetCpy = ctxCpy.model.cellModelAt(cellMTarget.cell.row, cellMTarget.cell.col);
        ctxCpy.model.placeNum(cellMTargetCpy.cell, tryNum);
        ctxCpy.recentlySolvedCellModels = [ cellMTargetCpy ];
        ctxCpy.cageModelsToReevaluatePerms = ctxCpy.model.cageModelsMap.values();

        try {
            ctxCpy.skipInit = true;
            ctxCpy.run(masterStrategy);
        } catch(e) {
            // throw e;
            cellMTarget.deleteNumOpt(tryNum);
            continue;
        }

        if (ctxCpy.model.isSolved) {
            // this.model.placeNum(cellMTarget.cell, tryNum);
            // this.recentlySolvedCellModels = [ cellMTarget ];
            this.cageModelsToReevaluatePerms = cellMTarget.withinCageModels;
            break;
        }
    }
}

function findCellMTargets(model) {
    const result = [];

    _.range(House.SIZE).forEach(row => {
        _.range(House.SIZE).forEach(col => {
            const cellM = model.cellModelAt(row, col);
            if (cellM.numOpts().size === 2) {
                result.push(cellM);
            }
        });
    });

    return result;
}
