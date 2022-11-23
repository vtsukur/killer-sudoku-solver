import { HouseSolver } from './houseSolver';

export class ColumnModel extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, ColumnModel.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseSolver.newHouseIterator(row => {
            return { row, col: idx };
        });
    }
}
