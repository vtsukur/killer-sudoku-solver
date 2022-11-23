import _ from 'lodash';
import { House } from '../../../problem/house';
import { BaseStrategy } from '../baseStrategy';

export class PlaceNumsForSingleOptionCellsStrategy extends BaseStrategy {
    constructor(model) {
        super(model);
    }

    apply(ctx) {
        const cellModels = [];

        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                const cellModel = ctx.model.cellModelAt(row, col);
                if (cellModel.numOpts().size === 1 && !cellModel.solved) {
                    ctx.model.placeNum(cellModel.cell, cellModel.numOpts().values().next().value);
                    cellModels.push(cellModel);
                }
            });
        });

        return cellModels;
    }
}
