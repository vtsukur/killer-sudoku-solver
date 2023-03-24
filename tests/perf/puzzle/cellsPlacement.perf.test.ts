import * as _ from 'lodash';
import { Cell } from '../../../src/puzzle/cell';
import { CellsPlacement } from '../../../src/puzzle/cellsPlacement';
import { House } from '../../../src/puzzle/house';

describe('Performance tests for `CellsPlacement`', () => {

    const TESTS = _.range(10);
    const ITERATIONS = _.range(100_000);

    const row0Cells = Cell.GRID[0];
    const cellsOfCount = House.INDICES.map(index => row0Cells.slice(0, index + 1));

    TESTS.forEach(i => {

        test(`Creation of \`CellsPlacement\`s of all possible sizes [${i}]`, () => {
            ITERATIONS.forEach(() => {
                new CellsPlacement(cellsOfCount[0]);
                new CellsPlacement(cellsOfCount[1]);
                new CellsPlacement(cellsOfCount[2]);
                new CellsPlacement(cellsOfCount[3]);
                new CellsPlacement(cellsOfCount[4]);
                new CellsPlacement(cellsOfCount[5]);
                new CellsPlacement(cellsOfCount[6]);
                new CellsPlacement(cellsOfCount[7]);
                new CellsPlacement(cellsOfCount[8]);
            });
        });

    });

});
