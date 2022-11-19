import { HouseSolver } from './houseSolver';

export class RowSolver extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, RowSolver.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseSolver.newHouseIterator(colIdx => {
            return { rowIdx: idx, colIdx };
        });
    }
}
