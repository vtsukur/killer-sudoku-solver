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
        cellMTargetCpy.placeNum(tryNum);

        try {
            ctxCpy.run(masterStrategy);
        } catch {
            continue;
        }

        if (ctxCpy.model.solved) {
            cellMTarget.placeNum(tryNum);
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
