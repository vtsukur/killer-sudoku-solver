import _ from 'lodash';
import { Grid } from '../../../puzzle/grid';

const TARGET_CELL_NUM_OPTS_COUNT = 2;

export function reduceCellOptionsWhichInvalidateSingleComboStrategy() {
    if (this.hasCageModelsToReevaluatePerms) return;

    let cageModelsToReduce = new Set();

    _.range(0, Grid.SIDE_LENGTH).forEach(row => {
        _.range(0, Grid.SIDE_LENGTH).forEach(col => {
            const cellM = this.model.cellModelsMatrix[row][col];
            if (cellM.solved || cellM.numOpts().size !== TARGET_CELL_NUM_OPTS_COUNT) return;

            const cellMsToCheck = collectCellModelsToCheck(cellM, this.model);
            const cageMsToCheck = collectCageModelsToCheck(cellMsToCheck);

            if (cageMsToCheck.size > 0) {
                for (const cageMToCheck of cageMsToCheck) {
                    const comboSet = new Set(cageMToCheck.combos.next().value);
                    for (const num of cellM.numOpts()) {
                        if (comboSet.has(num)) {
                            cellM.deleteNumOpt(num);
                            cageModelsToReduce = new Set([...cageModelsToReduce, ...cellM.withinCageModels]);
                        }
                    }
                }
            }
        });
    });

    this.cageModelsToReevaluatePerms = cageModelsToReduce.size > 0 ? cageModelsToReduce.values() : undefined;
}

function collectCellModelsToCheck(cellM, model) {
    const cellMs = new Set();
    addCellsFromHouse(cellMs, model.rowModels[cellM.cell.row], model);
    addCellsFromHouse(cellMs, model.columnModels[cellM.cell.col], model);
    addCellsFromHouse(cellMs, model.nonetModels[cellM.cell.nonet], model);
    cellMs.delete(cellM);
    return cellMs;
}

function addCellsFromHouse(cellMs, houseM, model) {
    for (const { row, col } of houseM.cellsIterator()) {
        cellMs.add(model.cellModelAt(row, col));
    }
}

function collectCageModelsToCheck(cellMs) {
    const cageMs = new Set();
    for (const cellM of cellMs) {
        if (cellM.solved) continue;

        for (const cageM of cellM.withinCageModels) {
            if (cageM.comboCount !== 1 || cageM.positioningFlags.isWithinHouse) continue;

            const withinArea = cageM.cellModels.every(aCellM => cellMs.has(aCellM));
            if (!withinArea) continue;

            cageMs.add(cageM);
        }
    }
    return cageMs;
}
