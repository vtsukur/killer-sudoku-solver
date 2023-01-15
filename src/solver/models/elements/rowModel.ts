import { Cell } from '../../../puzzle/cell';
import { CellsIterator } from '../../../puzzle/cellsIterator';
import { House } from '../../../puzzle/house';
import { HouseModel } from './houseModel';

export class RowModel extends HouseModel {
    constructor(idx: number, cells: ReadonlyArray<Cell>) {
        super(idx, cells, RowModel.cellsIterator);
    }

    static cellsIterator(row: number) {
        return new CellsIterator((col: number) => {
            return Cell.at(row, col);
        }, House.SIZE);
    }

    deepCopyWithoutCageModels() {
        return new RowModel(this.idx, this.cells);
    }
}
