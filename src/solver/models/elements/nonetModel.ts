import { Cell } from '../../../puzzle/cell';
import { Nonet } from '../../../puzzle/nonet';
import { HouseModel } from './houseModel';

export class NonetModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, NonetModel.cellsIteratorFor);
    }

    static cellsIteratorFor(idx: number) {
        return HouseModel.newCellsIterator((i: number) => {
            const nonetStartingRow = Math.floor(idx / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const nonetStartingCol = (idx % Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const row = nonetStartingRow + Math.floor(i / Nonet.SIDE_LENGTH);
            const col = nonetStartingCol + i % Nonet.SIDE_LENGTH;
            return Cell.at(row, col);
        });
    }

    deepCopyWithoutCageModels() {
        return new NonetModel(this.idx, this.cells);
    }
}
