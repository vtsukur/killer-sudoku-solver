import * as _ from 'lodash';
import { House, HouseIndex } from '../../../puzzle/house';
import { CellModel } from '../../models/elements/cellModel';
import { Strategy } from '../strategy';

export class PlaceNumsForSingleOptionCellsStrategy extends Strategy {
    execute() {
        const solved = new Array<CellModel>();

        _.range(House.CELL_COUNT).forEach((row: HouseIndex) => {
            _.range(House.CELL_COUNT).forEach((col: HouseIndex) => {
                const cellM = this._model.cellModelAt(row, col);
                if (cellM.numOpts().size === 1 && !cellM.solved) {
                    this._model.placeNum(cellM.cell, cellM.numOpts().values().next().value);
                    solved.push(cellM);
                }
            });
        });

        this._context.recentlySolvedCellModels = solved;
    }
}
