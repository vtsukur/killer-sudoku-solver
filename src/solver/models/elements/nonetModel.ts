import { Cell } from '../../../puzzle/cell';
import { CellsIterator } from '../../../puzzle/cellsIterator';
import { House } from '../../../puzzle/house';
import { Nonet } from '../../../puzzle/nonet';
import { HouseModel } from './houseModel';

export class NonetModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, NonetModel.cellsIterator);
    }

    static cellsIterator(nonet: number) {
        return new CellsIterator((index: number) => {
            const nonetStartingRow = Math.floor(nonet / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const nonetStartingCol = (nonet % Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const row = nonetStartingRow + Math.floor(index / Nonet.SIDE_LENGTH);
            const col = nonetStartingCol + index % Nonet.SIDE_LENGTH;
            return Cell.at(row, col);
        }, House.SIZE);
    }

    deepCopyWithoutCageModels() {
        return new NonetModel(this.idx, this.cells);
    }
}
