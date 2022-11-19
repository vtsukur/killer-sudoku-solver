import { HouseSolver } from './houseSolver';

export class ColumnSolver extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, ColumnSolver.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseSolver.newHouseIterator(rowIdx => {
            return { rowIdx, colIdx: idx };
        });
    }
}
