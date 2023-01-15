import { Cell } from '../../../puzzle/cell';
import { Row } from '../../../puzzle/row';
import { HouseModel } from './houseModel';

export class RowModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, Row.cellsIterator);
    }

    deepCopyWithoutCageModels() {
        return new RowModel(this.idx, this.cells);
    }
}
