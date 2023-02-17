import { ReadonlyCages } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { GridAreaCagesSegmentor } from '../../transform/gridAreaCagesSegmentor';

export class GridAreaModel {
    readonly cages;
    readonly cellsSet = new Set<Cell>();
    readonly nonOverlappingCellsSet = new Set<Cell>();
    sum = 0;

    constructor(cages: ReadonlyCages, n = 1) {
        this.cages = cages;

        cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsSet.add(cell);
            });
        });

        const { nonOverlappingCages } = GridAreaCagesSegmentor.segmentByCellsOverlap(cages, n);
        nonOverlappingCages.forEach(cage => {
            this.sum += cage.sum;
            cage.cells.forEach(cell => this.nonOverlappingCellsSet.add(cell));
        });
    }

    hasNonOverlapping(cell: Cell) {
        return this.nonOverlappingCellsSet.has(cell);
    }
}
