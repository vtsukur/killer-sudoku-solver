import { Cell } from '../../../puzzle/cell';
import { Column } from '../../../puzzle/column';
import { HouseModel } from './houseModel';

export class ColumnModel extends HouseModel {
    constructor(index: number, cells: ReadonlyArray<Cell>) {
        super(index, cells, Column.cellsIterator);
    }

    deepCopyWithoutCageModels() {
        return new ColumnModel(this.index, this.cells);
    }
}
