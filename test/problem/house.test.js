import { House } from '../../src/problem/house';

describe('House tests', () => {
    test('House is not construtable', () => {
        expect(() => new House()).toThrow('House is not constructable');
    });

    test('House size is 9', () => {
        expect(House.SIZE).toEqual(9);
    });

    test('House sum is 45', () => {
        expect(House.SUM).toEqual(45);
    });

    test('Nonet side length is 3', () => {
        expect(House.NONET_SIDE_LENGTH).toEqual(3);
    });
});
