import _ from 'lodash';
import { House } from '../../../problem/house';
import { InvalidSolverStepError } from '../../invalidSolverStateError';
import { masterStrategy } from '../masterStrategy';

export function deepTryOptionsStrategy() {
    if (this.hasCageModelsToReevaluatePerms || this.model.isSolved) return;

    const cellMTarget = findCellMTarget(this.model);
    if (_.isUndefined(cellMTarget)) return;

    const size = cellMTarget.numOpts().size;
    for (const tryNum of cellMTarget.numOpts()) {
        const ctxCpy = this.deepCopyForDeepTry();
        const cellMTargetCpy = ctxCpy.model.cellModelAt(cellMTarget.cell.row, cellMTarget.cell.col);
        cellMTargetCpy.reduceNumOptions(new Set([ tryNum ]));
        ctxCpy.cageModelsToReevaluatePerms = cellMTargetCpy.withinCageModels;

        try {
            ctxCpy.skipInit = true;
            console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}`);
            ctxCpy.run(masterStrategy);
            console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}. SUCCEEDED`);
        } catch(e) {
            if (e instanceof InvalidSolverStepError) {
                console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}. FAILED`);
                cellMTarget.deleteNumOpt(tryNum);
                continue;
            } else {
                throw e;
            }
        }

        if (ctxCpy.model.isSolved) {
            // this.cageModelsToReevaluatePerms = cellMTarget.withinCageModels;
            break;
        }
    }

    if (cellMTarget.numOpts().size === 1) {
        this.cageModelsToReevaluatePerms = cellMTarget.withinCageModels;
    }
}

function findCellMTarget(model) {
    const cellNumOptsMap = new Map();
    _.range(House.SIZE).forEach(idx => cellNumOptsMap.set(idx + 1, []));

    _.range(House.SIZE).forEach(row => {
        _.range(House.SIZE).forEach(col => {
            const cellM = model.cellModelAt(row, col);
            cellNumOptsMap.get(cellM.numOpts().size).push(cellM);
        });
    });

    const targetSize = [2, 3].find(size => cellNumOptsMap.get(size).length > 0);
    if (targetSize) {
        return cellNumOptsMap.get(targetSize)[0];
    } else {
        return undefined;
    }
}
