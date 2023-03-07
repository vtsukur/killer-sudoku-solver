import { House } from '../../../src/puzzle/house';

describe('Unit tests for `House`', () => {

    test('There are 9 `House`s of one type (`Row`, `Column` and `Nonet`) per `Grid`', () => {
        expect(House.COUNT).toEqual(9);
    });

    test('There are 9 `House`s of one type (`Row`, `Column` or `Nonet`) per `Grid`', () => {
        expect(Array.from(House.COUNT_RANGE)).toEqual([ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]);
    });

    test('Amount of `Cell`s in a `House` is `9`', () => {
        expect(House.CELL_COUNT).toEqual(9);
    });

    test('Sum of `Cell`s in a `House` is `45`', () => {
        expect(House.SUM).toEqual(45);
    });

});
