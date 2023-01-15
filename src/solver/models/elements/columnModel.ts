import { Cell } from '../../../puzzle/cell';
import { CellsIterator } from '../../../puzzle/cellsIterator';
import { House } from '../../../puzzle/house';
import { HouseModel } from './houseModel';

export class ColumnModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, ColumnModel.cellsIterator);
    }

    static cellsIterator(col: number) {
        return new CellsIterator((row: number) => {
            return Cell.at(row, col);
        }, House.SIZE);
    }

    deepCopyWithoutCageModels() {
        return new ColumnModel(this.idx, this.cells);
    }
}
