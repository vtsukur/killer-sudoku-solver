import { House } from '../../../src/puzzle/house';

describe('House tests', () => {
    test('House size is 9', () => {
        expect(House.SIZE).toEqual(9);
    });

    test('House sum is 45', () => {
        expect(House.SUM).toEqual(45);
    });
});
