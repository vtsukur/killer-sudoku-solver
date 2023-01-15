import { House } from '../../../src/puzzle/house';

describe('House tests', () => {
    test('There are 9 Houses of one type per Grid', () => {
        expect(House.COUNT_OF_ONE_TYPE).toEqual(9);
    });

    test('House size is 9', () => {
        expect(House.SIZE).toEqual(9);
    });

    test('House sum is 45', () => {
        expect(House.SUM).toEqual(45);
    });
});
