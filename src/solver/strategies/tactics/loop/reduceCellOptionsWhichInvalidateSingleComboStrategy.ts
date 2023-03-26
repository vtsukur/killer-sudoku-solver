import * as _ from 'lodash';
import { Grid } from '../../../../puzzle/grid';
import { HouseIndex } from '../../../../puzzle/house';
import { CageModel } from '../../../models/elements/cageModel';
import { CellModel } from '../../../models/elements/cellModel';
import { HouseModel } from '../../../models/elements/houseModel';
import { MasterModel } from '../../../models/masterModel';
import { Strategy } from '../../strategy';

const TARGET_CELL_NUM_OPTS_COUNT = 2;

export class ReduceCellOptionsWhichInvalidateSingleComboStrategy extends Strategy {

    execute() {
        if (this._context.reduction.isNotEmpty) return;

        const reduction = this._context.reduction;

        _.range(0, Grid.SIDE_CELL_COUNT).forEach((row: HouseIndex) => {
            _.range(0, Grid.SIDE_CELL_COUNT).forEach((col: HouseIndex) => {
                const cellM = this._model.cellModelsMatrix[row][col];
                if (cellM.solved || cellM.numOpts().length !== TARGET_CELL_NUM_OPTS_COUNT) return;

                const cellMsToCheck = collectCellMsToCheck(cellM, this._model);
                const cageMsToCheck = collectCageMsToCheck(cellMsToCheck);

                if (cageMsToCheck.size > 0) {
                    for (const cageMToCheck of cageMsToCheck) {
                        for (const num of cellM.numOpts()) {
                            if (cageMToCheck.combos[0].has(num)) {
                                reduction.deleteNumOpt(cellM, num);
                            }
                        }
                    }
                }
            });
        });
    }

}

function collectCellMsToCheck(cellM: CellModel, model: MasterModel) {
    const cellMs = new Set<CellModel>();
    addCellsFromHouse(cellMs, model.rowModels[cellM.cell.row], model);
    addCellsFromHouse(cellMs, model.columnModels[cellM.cell.col], model);
    addCellsFromHouse(cellMs, model.nonetModels[cellM.cell.nonet], model);
    cellMs.delete(cellM);
    return cellMs;
}

function addCellsFromHouse(cellMs: Set<CellModel>, houseM: HouseModel, model: MasterModel) {
    for (const { row, col } of houseM.cells) {
        cellMs.add(model.cellModelAt(row, col));
    }
}

function collectCageMsToCheck(cellMs: ReadonlySet<CellModel>) {
    const cageMs = new Set<CageModel>();
    for (const cellM of cellMs) {
        if (cellM.solved) continue;

        for (const cageM of cellM.withinCageModels) {
            if (cageM.comboCount !== 1 || cageM.cage.placement.isWithinHouse) continue;

            const withinArea = cageM.cellMs.every(aCellM => cellMs.has(aCellM));
            if (!withinArea) continue;

            cageMs.add(cageM);
        }
    }
    return cageMs;
}
