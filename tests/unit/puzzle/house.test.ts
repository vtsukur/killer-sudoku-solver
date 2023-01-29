import { Cell } from '../../../src/puzzle/cell';
import { House } from '../../../src/puzzle/house';

describe('House tests', () => {
    test('There are 9 Houses of one type (Row, Column or Nonet) per Grid', () => {
        expect(House.COUNT_OF_ONE_TYPE_PER_GRID).toEqual(9);
    });

    test('House Cell count is 9', () => {
        expect(House.CELL_COUNT).toEqual(9);
    });

    test('Sum of Cells in a House is 45', () => {
        expect(House.SUM).toEqual(45);
    });

    test('Iterating over Cells', () => {
        const firstRowCellsIterator = House.newCellsIterator((index) => Cell.at(0, index));
        const cells = Array.from(firstRowCellsIterator);
        expect(cells[0]).toEqual([
            Cell.at(0, 0), Cell.at(0, 1), Cell.at(0, 2),
            Cell.at(0, 3), Cell.at(0, 4), Cell.at(0, 5),
            Cell.at(0, 6), Cell.at(0, 7), Cell.at(0, 8)
        ]);
    });
});
