import { Cell } from '../../../puzzle/cell';
import { HouseModel } from './houseModel';

export class RowModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, RowModel.iteratorFor);
    }

    static iteratorFor(idx: number) {
        return HouseModel.newCellsIterator((col: number) => {
            return Cell.at(idx, col);
        });
    }

    deepCopyWithoutCageModels() {
        return new RowModel(this.idx, this.cells);
    }
}
