import { ReadonlyCells } from '../../../puzzle/cell';
import { HouseModel } from './houseModel';

export class NonetModel extends HouseModel {

    constructor(index: number, cells: ReadonlyCells) {
        super(index, cells);
    }

    deepCopyWithoutCageModels() {
        return new NonetModel(this.index, this.cells);
    }

}
