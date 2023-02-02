import * as _ from 'lodash';
import { House, HouseIndex } from '../../../puzzle/house';
import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { MasterStrategy } from '../masterStrategy';
import { logFactory } from '../../../util/logFactory';
import { MasterModel } from '../../models/masterModel';
import { Strategy } from '../strategy';
import { ReducedCellModels } from '../reducedCellModels';
import { NumSet } from '../../math';

const log = logFactory.withLabel('Advanced Solver - DeepTryOptionsStrategy');

export class DeepTryOptionsStrategy extends Strategy {
    execute() {
        if (this._context.hasCageModelsToReduce || this._model.isSolved) return;

        const cellMTarget = findCellMTarget(this._model);
        if (_.isUndefined(cellMTarget)) return;

        const size = cellMTarget.numOpts().size;
        let solution;
        for (const tryNum of cellMTarget.numOpts()) {
            const ctxCpy = this._context.deepCopyForDeepTry();
            const cellMTargetCpy = ctxCpy.model.cellModelAt(cellMTarget.cell.row, cellMTarget.cell.col);
            cellMTargetCpy.reduceNumOptions(new NumSet(tryNum));
            ctxCpy.setCageModelsToReduceFrom(ReducedCellModels.forOne(cellMTargetCpy));

            try {
                ctxCpy.skipInit = true;
                if (ctxCpy.depth === 1) {
                    log.info(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}`);
                }
                new MasterStrategy(ctxCpy).execute();
                if (ctxCpy.depth === 1) {
                    log.info(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}. SUCCEEDED`);
                }
            } catch(e) {
                if (e instanceof InvalidSolverStateError) {
                    if (ctxCpy.depth === 1) {
                        log.info(`Deep try for ${tryNum} at ${cellMTarget.cell.key}. Size: ${size}. Depth: ${ctxCpy.depth}. FAILED`);
                    }
                    cellMTarget.deleteNumOpt(tryNum);
                    continue;
                } else {
                    throw e;
                }
            }

            if (ctxCpy.model.isSolved) {
                solution = ctxCpy.model.solution;
                cellMTarget.reduceNumOptions(new NumSet(tryNum));
                break;
            } else if (ctxCpy.isSolutionFound) {
                solution = ctxCpy.foundSolution;
                break;
            }
        }

        if (!_.isUndefined(solution)) {
            if (this._context.depth === 0) {
                this._model.applySolution(solution as Array<Array<number>>);
            } else {
                this._context.foundSolution = solution;
            }
        } else if (cellMTarget.numOpts().size < size) {
            this._context.setCageModelsToReduceFrom(ReducedCellModels.forOne(cellMTarget));
        }
    }
}

function findCellMTarget(model: MasterModel) {
    const cellNumOptsMap = new Map();
    _.range(House.CELL_COUNT).forEach((index: number) => cellNumOptsMap.set(index + 1, []));

    _.range(House.CELL_COUNT).forEach((row: HouseIndex) => {
        _.range(House.CELL_COUNT).forEach((col: HouseIndex) => {
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
