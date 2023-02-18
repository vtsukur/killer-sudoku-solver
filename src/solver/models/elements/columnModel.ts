import { ReadonlyCells } from '../../../puzzle/cell';
import { Column } from '../../../puzzle/column';
import { HouseModel } from './houseModel';

export class ColumnModel extends HouseModel {

    constructor(index: number, cells: ReadonlyCells) {
        super(index, cells, Column.newCellsIterator);
    }

    deepCopyWithoutCageModels() {
        return new ColumnModel(this.index, this.cells);
    }

}
