import _ from 'lodash';
import { House } from '../../../puzzle/house';

export function placeNumsForSingleOptionCellsStrategy() {
    const solved = [];

    _.range(House.SIZE).forEach(row => {
        _.range(House.SIZE).forEach(col => {
            const cellModel = this.model.cellModelAt(row, col);
            if (cellModel.numOpts().size === 1 && !cellModel.solved) {
                this.model.placeNum(cellModel.cell, cellModel.numOpts().values().next().value);
                solved.push(cellModel);
            }
        });
    });

    this.recentlySolvedCellModels = solved;
}
