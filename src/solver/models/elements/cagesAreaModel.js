import { House } from '../../../problem/house';
import { clusterCagesByOverlap } from '../../combinatorial/combinatorial';

export class CagesAreaModel {
    constructor(cages, absMaxAreaCellCount = House.SIZE) {
        this.cages = cages;
        this.cellsSet = new Set();
        this.nonOverlappingCellsSet = new Set();
        this.sum = 0;
        cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsSet.add(cell);
            });
        });

        const { nonOverlappingCages } = clusterCagesByOverlap(cages, new Set(this.cellsSet), absMaxAreaCellCount);
        nonOverlappingCages.forEach(cage => {
            this.sum += cage.sum;
            cage.cells.forEach(cell => this.nonOverlappingCellsSet.add(cell));
        });
    }

    hasNonOverlapping(cell) {
        return this.nonOverlappingCellsSet.has(cell);
    }
}
