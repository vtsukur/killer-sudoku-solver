import problemReader from '../src/reader.js';
import { Cell, InputSum, Problem } from '../src/meta.js';

describe('Reader tests', () => {
    test("Addition of 2 numbers", () => {
        const problem = problemReader('./problems/readerBaseTest.txt');
        expect(problem).toEqual(new Problem([
            new InputSum(17, [
                new Cell(1, 1), new Cell(1, 2), new Cell(1, 3)
            ]),
            new InputSum(7, [ new Cell(1, 4) ]),
            new InputSum(9, [
                new Cell(1, 5), new Cell(1, 6)
            ]),
        ]));
    });
});
