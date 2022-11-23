import { HouseModel } from './houseModel';

export class RowModel extends HouseModel {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, RowModel.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseModel.newHouseIterator(col => {
            return { row: idx, col };
        });
    }
}
