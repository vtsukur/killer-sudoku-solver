import { HouseModel } from './houseModel';

export class ColumnModel extends HouseModel {
    constructor(idx, cells) {
        super(idx, cells, ColumnModel.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseModel.newHouseIterator(row => {
            return { row, col: idx };
        });
    }
}
