import { Cell } from '../../../puzzle/cell';
import { Row } from '../../../puzzle/row';
import { HouseModel } from './houseModel';

export class RowModel extends HouseModel {
    constructor(index: number, cells: ReadonlyArray<Cell>) {
        super(index, cells, Row.cellsIterator);
    }

    deepCopyWithoutCageModels() {
        return new RowModel(this.index, this.cells);
    }
}
