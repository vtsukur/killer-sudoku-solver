import _ from 'lodash';
import { House } from '../../problem/house';
import { BaseModelStrategy } from './baseModelStrategy';

export class PlaceNumsForSingleOptionCellsStrategy extends BaseModelStrategy {
    constructor(model) {
        super(model);
    }

    apply() {
        const cellsSolvers = [];

        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                const cellSolver = this.model.cellSolverAt(row, col);
                if (cellSolver.numOpts().size === 1 && !cellSolver.solved) {
                    this.model.placeNum(cellSolver.cell, cellSolver.numOpts().values().next().value);
                    cellsSolvers.push(cellSolver);
                }
            });
        });

        return cellsSolvers;
    }
}
