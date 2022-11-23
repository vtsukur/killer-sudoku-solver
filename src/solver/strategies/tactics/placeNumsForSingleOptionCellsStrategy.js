import _ from 'lodash';
import { House } from '../../../problem/house';

export const placeNumsForSingleOptionCellsStrategy = (ctx) => {
    const solved = [];

    _.range(House.SIZE).forEach(row => {
        _.range(House.SIZE).forEach(col => {
            const cellModel = ctx.model.cellModelAt(row, col);
            if (cellModel.numOpts().size === 1 && !cellModel.solved) {
                ctx.model.placeNum(cellModel.cell, cellModel.numOpts().values().next().value);
                solved.push(cellModel);
            }
        });
    });

    ctx.recentlySolvedCellModels = solved;
}
