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
});
