import reader from '../src/reader.js';
import { SummedArea } from '../src/solver';

describe('Solver tests', () => {
    test('Solve full', () => {
        const problem = reader('./problems/1.txt');
    });

    // test('Reduce options for 2-cell areas', () => {
    //     new SummedArea(4, [ new Cell(1, 1), new Cell(1, 2) ]).reduceOptions();
    // });
});
