import _ from 'lodash';
import { Grid } from '../../../src/puzzle/grid';

describe('Grid tests', () => {
    test('Grid side length is 9', () => {
        expect(Grid.SIDE_LENGTH).toEqual(9);
    });

    test('Grid has 81 cells', () => {
        expect(Grid.CELL_COUNT).toEqual(81);
    });

    test('Sum of all cells in the grid is 405', () => {
        expect(Grid.SIDE_LENGTH).toEqual(9);
    });

    test('Iterate over rows and columns', () => {
        const rowsAndColsTouchMarks = new Array(Grid.SIDE_LENGTH).fill().map(() => new Array(Grid.SIDE_LENGTH).fill(0));
        const iTouchMarks = new Array(Grid.CELL_COUNT).fill(0);

        let totalCount = 0;
        for (const { row, col, i } of Grid.iterator()) {
            rowsAndColsTouchMarks[row][col]++;
            iTouchMarks[i]++;
            totalCount++;
        }

        expect(totalCount).toBe(Grid.CELL_COUNT);
        _.range(Grid.SIDE_LENGTH).forEach(row => {
            _.range(Grid.SIDE_LENGTH).forEach(col => {
                expect(rowsAndColsTouchMarks[row][col]).toBe(1);
            });
        });
        _.range(Grid.CELL_COUNT).forEach(i => {
            expect(iTouchMarks[i]).toBe(1);
        });
    });
});
