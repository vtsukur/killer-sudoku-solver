import * as _ from 'lodash';
import { House } from '../../../puzzle/house';
import { CellModel } from '../../models/elements/cellModel';
import { Context } from '../context';

export function placeNumsForSingleOptionCellsStrategy(this: Context) {
    const solved = new Array<CellModel>();

    _.range(House.SIZE).forEach((row: number) => {
        _.range(House.SIZE).forEach((col: number) => {
            const cellModel = this.model.cellModelAt(row, col);
            if (cellModel.numOpts().size === 1 && !cellModel.solved) {
                this.model.placeNum(cellModel.cell, cellModel.numOpts().values().next().value);
                solved.push(cellModel);
            }
        });
    });

    this.recentlySolvedCellModels = solved;
}
