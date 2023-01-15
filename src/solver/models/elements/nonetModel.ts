import { Cell } from '../../../puzzle/cell';
import { Nonet } from '../../../puzzle/nonet';
import { HouseModel } from './houseModel';

export class NonetModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, Nonet.cellsIterator);
    }

    deepCopyWithoutCageModels() {
        return new NonetModel(this.idx, this.cells);
    }
}
