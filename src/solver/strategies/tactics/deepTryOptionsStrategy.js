import _ from 'lodash';
import { House } from '../../../problem/house';
import { InvalidSolverStepError } from '../../invalidSolverStateError';
import { masterStrategy } from '../masterStrategy';

export function deepTryOptionsStrategy() {
    if (this.hasCageModelsToReevaluatePerms || this.model.isSolved) return;

    const cellMTarget = findCellMTarget(this.model);
    if (_.isUndefined(cellMTarget)) return;

    const size = cellMTarget.numOpts().size;
    let solution;
    for (const tryNum of cellMTarget.numOpts()) {
        const ctxCpy = this.deepCopyForDeepTry();
        const cellMTargetCpy = ctxCpy.model.cellModelAt(cellMTarget.cell.row, cellMTarget.cell.col);
        cellMTargetCpy.reduceNumOptions(new Set([ tryNum ]));
        ctxCpy.cageModelsToReevaluatePerms = cellMTargetCpy.withinCageModels;

        try {
            ctxCpy.skipInit = true;
            if (ctxCpy.depth === 1) {
                console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}`);
            }
            ctxCpy.run(masterStrategy);
            if (ctxCpy.depth === 1) {
                console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}. SUCCEEDED`);
            }
        } catch(e) {
            if (e instanceof InvalidSolverStepError) {
                if (ctxCpy.depth === 1) {
                    console.log(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}. FAILED`);
                }
                cellMTarget.deleteNumOpt(tryNum);
                continue;
            } else {
                throw e;
            }
        }

        if (ctxCpy.model.isSolved) {
            solution = ctxCpy.model.solution;
            cellMTarget.reduceNumOptions(new Set([ tryNum ]));
            break;
        } else if (ctxCpy.isSolutionFound) {
            solution = ctxCpy.foundSolution;
            break;
        }
    }

    if (!_.isUndefined(solution)) {
        if (this.depth === 0) {
            this.model.applySolution(solution);
        } else {
            this.foundSolution = solution;
        }
    } else if (cellMTarget.numOpts().size < size) {
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
