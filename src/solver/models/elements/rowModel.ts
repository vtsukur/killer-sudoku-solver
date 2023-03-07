import { ReadonlyCells } from '../../../puzzle/cell';
import { HouseModel } from './houseModel';

export class RowModel extends HouseModel {

    constructor(index: number, cells: ReadonlyCells) {
        super(index, cells);
    }

    deepCopyWithoutCageModels() {
        return new RowModel(this.index, this.cells);
    }

}
