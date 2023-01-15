import { Cell } from '../../../puzzle/cell';
import { HouseModel } from './houseModel';

export class ColumnModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, ColumnModel.iteratorFor);
    }

    static iteratorFor(idx: number) {
        return HouseModel.newCellsIterator((row: number) => {
            return Cell.at(row, idx);
        });
    }

    deepCopyWithoutCageModels() {
        return new ColumnModel(this.idx, this.cells);
    }
}
