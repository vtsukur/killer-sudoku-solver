import { HouseSolver } from './houseSolver';

export class RowModel extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, RowModel.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseSolver.newHouseIterator(col => {
            return { row: idx, col };
        });
    }
}
