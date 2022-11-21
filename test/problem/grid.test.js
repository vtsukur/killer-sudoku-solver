import { Grid } from '../../src/problem/grid';

describe('Grid tests', () => {
    test('Grid is not construtable', () => {
        expect(() => new Grid()).toThrow('Grid is not constructable');
    });

    test('Grid side length is 9', () => {
        expect(Grid.SIDE_LENGTH).toEqual(9);
    });

    test('Grid has 81 cells', () => {
        expect(Grid.CELL_COUNT).toEqual(81);
    });

    test('Sum of all cells in the grid is 405', () => {
        expect(Grid.SIDE_LENGTH).toEqual(9);
    });
});
