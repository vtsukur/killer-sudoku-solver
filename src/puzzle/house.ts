import { CellProducer, CellsIterator } from './cellsIterator';

export class House {
    static readonly COUNT_OF_ONE_TYPE = 9;
    static readonly CELL_COUNT = 9;
    static readonly SUM = 45;

    static newCellsIterator(cellProducer: CellProducer) {
        return new CellsIterator(cellProducer, this.COUNT_OF_ONE_TYPE);
    }
}
