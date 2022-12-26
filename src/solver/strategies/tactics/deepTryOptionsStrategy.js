import _ from 'lodash';
import { House } from '../../../problem/house';
import { InvalidSolverStepError } from '../../invalidSolverStateError';
import { masterStrategy } from '../masterStrategy';

export function deepTryOptionsStrategy() {
    if (this.hasCageModelsToReevaluatePerms || this.model.solved) return;

    const cellMTargets = findCellMTargets(this.model);
    if (cellMTargets.length === 0) return;

    const cellMTarget = cellMTargets[0];

    for (const tryNum of cellMTarget.numOpts()) {
        const ctxCpy = this.deepCopyForDeepTry();
        const cellMTargetCpy = ctxCpy.model.cellModelAt(cellMTarget.cell.row, cellMTarget.cell.col);
        ctxCpy.model.placeNum(cellMTargetCpy.cell, tryNum);
        ctxCpy.recentlySolvedCellModels = [ cellMTargetCpy ];
        ctxCpy.cageModelsToReevaluatePerms = ctxCpy.model.cageModelsMap.values();

        try {
            ctxCpy.skipInit = true;
            console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Depth: ${ctxCpy.depth}`);
            ctxCpy.run(masterStrategy);
            console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Depth: ${ctxCpy.depth}. SUCCEEDED`);
        } catch(e) {
            if (e instanceof InvalidSolverStepError) {
                console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Depth: ${ctxCpy.depth}. FAILED`);
                cellMTarget.deleteNumOpt(tryNum);
                continue;
            } else {
                throw e;
            }
        }

        if (ctxCpy.model.isSolved) {
            break;
        }
    }

    if (cellMTarget.numOpts().size === 1) {
        this.cageModelsToReevaluatePerms = cellMTarget.withinCageModels;
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
