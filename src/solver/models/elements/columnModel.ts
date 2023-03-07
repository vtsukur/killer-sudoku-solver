import { ReadonlyCells } from '../../../puzzle/cell';
import { HouseModel } from './houseModel';

export class ColumnModel extends HouseModel {

    constructor(index: number, cells: ReadonlyCells) {
        super(index, cells);
    }

    deepCopyWithoutCageModels() {
        return new ColumnModel(this.index, this.cells);
    }

}
