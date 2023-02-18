import { ReadonlyCells } from '../../../puzzle/cell';
import { Row } from '../../../puzzle/row';
import { HouseModel } from './houseModel';

export class RowModel extends HouseModel {

    constructor(index: number, cells: ReadonlyCells) {
        super(index, cells, Row.newCellsIterator);
    }

    deepCopyWithoutCageModels() {
        return new RowModel(this.index, this.cells);
    }

}
