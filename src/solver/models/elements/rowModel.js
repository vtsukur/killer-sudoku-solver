import { HouseModel } from './houseModel';

export class RowModel extends HouseModel {
    constructor(idx, cells) {
        super(idx, cells, RowModel.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseModel.newHouseIterator(col => {
            return { row: idx, col };
        });
    }

    deepCopyWithoutCageModels() {
        return new RowModel(this.idx, this.cells);
    }
}
