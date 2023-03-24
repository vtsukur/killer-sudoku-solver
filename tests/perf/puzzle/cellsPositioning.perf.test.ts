import * as _ from 'lodash';
import { Cell } from '../../../src/puzzle/cell';
import { CellsPositioning } from '../../../src/puzzle/cellsPositioning';
import { House } from '../../../src/puzzle/house';

describe('Performance tests for `CellsPositioning`', () => {

    const TESTS = _.range(10);
    const ITERATIONS = _.range(20_000);

    const row0Cells = Cell.GRID[0];
    const cellsOfCount = House.INDICES.map(index => row0Cells.slice(0, index + 1));

    TESTS.forEach(i => {

        test(`Creation of \`CellsPositioning\`s of all possible sizes [${i}]`, () => {
            ITERATIONS.forEach(() => {
                new CellsPositioning(cellsOfCount[0]);
                new CellsPositioning(cellsOfCount[1]);
                new CellsPositioning(cellsOfCount[2]);
                new CellsPositioning(cellsOfCount[3]);
                new CellsPositioning(cellsOfCount[4]);
                new CellsPositioning(cellsOfCount[5]);
                new CellsPositioning(cellsOfCount[6]);
                new CellsPositioning(cellsOfCount[7]);
                new CellsPositioning(cellsOfCount[8]);
            });
        });

    });

});
