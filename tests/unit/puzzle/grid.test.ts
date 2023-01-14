import * as _ from 'lodash';
import { Grid } from '../../../src/puzzle/grid';

describe('Grid tests', () => {
    test('Grid side length is 9', () => {
        expect(Grid.SIDE_LENGTH).toEqual(9);
    });

    test('Grid has 81 cells', () => {
        expect(Grid.CELL_COUNT).toEqual(81);
    });

    test('Sum of all cells in the grid is 405', () => {
        expect(Grid.TOTAL_SUM).toEqual(405);
    });

    test('Determination of Cell indices within Grid', () => {
        let indexWithinGrid = 0;
        _.range(Grid.SIDE_LENGTH).forEach(row => {
            _.range(Grid.SIDE_LENGTH).forEach(col => {
                expect(Grid.cellIndexAt(row, col)).toBe(indexWithinGrid);
                indexWithinGrid++;
            });
        });
    });

    test('Iteration over rows and columns', () => {
        const rowsAndColsIterationCounters = new Array(Grid.SIDE_LENGTH).fill(undefined)
            .map(() => new Array(Grid.SIDE_LENGTH).fill(0));
        const indexWithinGridCounters = new Array(Grid.CELL_COUNT).fill(0);

        let index = 0;
        for (const { row, col, indexWithinGrid } of Grid.cellsIterator()) {
            expect(indexWithinGrid).toBe(index);
            index++;
            rowsAndColsIterationCounters[row][col]++;
            indexWithinGridCounters[indexWithinGrid]++;
        }

        const totalCount = index;
        expect(totalCount).toBe(Grid.CELL_COUNT);
        _.range(Grid.SIDE_LENGTH).forEach(row => {
            _.range(Grid.SIDE_LENGTH).forEach(col => {
                expect(rowsAndColsIterationCounters[row][col]).toBe(1);
            });
        });
        _.range(Grid.CELL_COUNT).forEach(i => {
            expect(indexWithinGridCounters[i]).toBe(1);
        });
    });

    test('Creation of Grid matrix', () => {
        const matrix = Grid.newMatrix();

        expect(matrix.length).toBe(Grid.SIDE_LENGTH);
        for (const row of matrix) {
            expect(row.length).toBe(Grid.SIDE_LENGTH);
            for (const el of row) {
                expect(el).toBeUndefined();
            }
        }
    });
});
