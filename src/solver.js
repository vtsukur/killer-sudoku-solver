import { Problem } from './problem';

export class SummedArea {
    constructor(sum, cells) {
        this.sum = sum;
        this.cells = cells;
        this.subgridsIndices = new Set(cells.collect(cell => cell.subgridIndex));
    }

    reduceOptions() {

    }
}

export class Solver {

}
