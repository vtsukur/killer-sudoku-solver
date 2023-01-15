import * as _ from 'lodash';
import { Column } from '../../../src/puzzle/column';
import { House } from '../../../src/puzzle/house';

describe('Column tests', () => {
    test('Iteration over Cells', () => {
        _.range(House.COUNT_OF_ONE_TYPE).forEach(col => {
            const rowIterationCounters = new Array(House.SIZE).fill(0);

            let index = 0;
            for (const cell of Column.cellsIterator(col)) {
                expect(cell.row).toBe(index);
                expect(cell.col).toBe(col);
                expect(cell.indexWithinGrid).toBe(cell.row * House.SIZE + col);
                rowIterationCounters[index]++;
                index++;
            }
    
            for (const counter of rowIterationCounters) {
                expect(counter).toBe(1);
            }    
        });
    });
});
