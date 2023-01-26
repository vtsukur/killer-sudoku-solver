import { ReadonlyCells } from '../../../puzzle/cell';
import { Nonet } from '../../../puzzle/nonet';
import { HouseModel } from './houseModel';

export class NonetModel extends HouseModel {
    constructor(index: number, cells: ReadonlyCells) {
        super(index, cells, Nonet.cellsIterator);
    }

    deepCopyWithoutCageModels() {
        return new NonetModel(this.index, this.cells);
    }
}
