import { Cell } from '../../../puzzle/cell';
import { Column } from '../../../puzzle/column';
import { HouseModel } from './houseModel';

export class ColumnModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, Column.cellsIterator);
    }

    deepCopyWithoutCageModels() {
        return new ColumnModel(this.idx, this.cells);
    }
}
