import * as _ from 'lodash';
import { House } from '../../../puzzle/house';
import { CellModel } from '../../models/elements/cellModel';
import { Context } from '../context';

export function placeNumsForSingleOptionCellsStrategy(this: Context) {
    const solved = new Array<CellModel>();

    _.range(House.SIZE).forEach((row: number) => {
        _.range(House.SIZE).forEach((col: number) => {
            const cellM = this.model.cellModelAt(row, col);
            if (cellM.numOpts().size === 1 && !cellM.solved) {
                this.model.placeNum(cellM.cell, cellM.numOpts().values().next().value);
                solved.push(cellM);
            }
        });
    });

    this.recentlySolvedCellModels = solved;
}
