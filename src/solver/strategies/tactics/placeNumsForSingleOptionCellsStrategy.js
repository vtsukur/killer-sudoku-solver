import _ from 'lodash';
import { House } from '../../../problem/house';
import { BaseStrategy } from '../baseStrategy';

export class PlaceNumsForSingleOptionCellsStrategy extends BaseStrategy {
    constructor(model) {
        super(model);
    }

    apply() {
        const cellModels = [];

        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                const cellModel = this.model.cellModelAt(row, col);
                if (cellModel.numOpts().size === 1 && !cellModel.solved) {
                    this.model.placeNum(cellModel.cell, cellModel.numOpts().values().next().value);
                    cellModels.push(cellModel);
                }
            });
        });

        return cellModels;
    }
}
