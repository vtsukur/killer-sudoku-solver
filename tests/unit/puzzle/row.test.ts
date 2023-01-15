import * as _ from 'lodash';
import { House } from '../../../src/puzzle/house';
import { Row } from '../../../src/puzzle/row';

describe('Row tests', () => {
    test('Iteration over Cells', () => {
        _.range(House.COUNT_OF_ONE_TYPE).forEach(row => {
            const colIterationCounters = new Array(House.SIZE).fill(0);

            let index = 0;
            for (const cell of Row.cellsIterator(row)) {
                expect(cell.row).toBe(row);
                expect(cell.col).toBe(index);
                expect(cell.indexWithinGrid).toBe(row * House.SIZE + index);
                colIterationCounters[index]++;
                index++;
            }
    
            for (const counter of colIterationCounters) {
                expect(counter).toBe(1);
            }
        });
    });
});
