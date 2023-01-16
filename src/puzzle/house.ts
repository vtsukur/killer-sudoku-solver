import { CellProducer, CellsIterator } from './cellsIterator';

class HouseAPI {
    readonly COUNT_OF_ONE_TYPE = 9;
    readonly SIZE = 9;
    readonly SUM = 45;

    cellsIterator(cellProducer: CellProducer) {
        return new CellsIterator(cellProducer, House.COUNT_OF_ONE_TYPE);
    }
}

export const House = Object.freeze(new HouseAPI());
