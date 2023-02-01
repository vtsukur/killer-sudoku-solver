import { ReadonlyCages } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { clusterCagesByOverlap } from '../../math';

export class CagesAreaModel {
    readonly cages;
    readonly cellsSet = new Set<Cell>();
    readonly nonOverlappingCellsSet = new Set<Cell>();
    sum = 0;

    constructor(cages: ReadonlyCages, absMaxAreaCellCount = House.CELL_COUNT) {
        this.cages = cages;

        cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsSet.add(cell);
            });
        });

        const { nonOverlappingCages } = clusterCagesByOverlap(cages, Array.from(this.cellsSet), absMaxAreaCellCount);
        nonOverlappingCages.forEach(cage => {
            this.sum += cage.sum;
            cage.cells.forEach(cell => this.nonOverlappingCellsSet.add(cell));
        });
    }

    hasNonOverlapping(cell: Cell) {
        return this.nonOverlappingCellsSet.has(cell);
    }
}
