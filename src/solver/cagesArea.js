import { House } from '../problem/house';
import { clusterCagesByOverlap } from './combinatorial';

export class CagesArea {
    constructor(cages = [], absMaxAreaCellCount = House.SIZE) {
        this.cages = cages;
        this.cellsSet = new Set();
        this.nonOverlappingCellsSet = new Set();
        this.totalValue = 0;
        cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsSet.add(cell);
            }, this);
        }, this);

        const { nonOverlappingCages } = clusterCagesByOverlap(cages, new Set(this.cellsSet), absMaxAreaCellCount);
        nonOverlappingCages.forEach(cage => {
            this.totalValue += cage.sum;
            cage.cells.forEach(cell => this.nonOverlappingCellsSet.add(cell));
        });
    }

    hasNonOverlapping(cell) {
        return this.nonOverlappingCellsSet.has(cell);
    }
}
