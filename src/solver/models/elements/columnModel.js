import { HouseModel } from './houseModel';

export class ColumnModel extends HouseModel {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, ColumnModel.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseModel.newHouseIterator(row => {
            return { row, col: idx };
        });
    }
}
