import problemReader from '../src/reader.js';
import { Problem, InputSum, Cell } from '../src/meta.js';

describe('Reader tests', () => {
    test('Basic read', () => {
        const problem = problemReader('./test/readerBaseTest.txt');
        expect(problem).toEqual(new Problem([
            new InputSum(17, [ new Cell(1, 1), new Cell(1, 2), new Cell(1, 3) ]),
            new InputSum(7, [ new Cell(1, 4) ]),
            new InputSum(9, [ new Cell(1, 5), new Cell(1, 6) ]),
        ]));
    });

    test('Full read', () => {
        const problem = problemReader('./problems/1.txt');
        expect(problem).toEqual(new Problem([
            // big row 1
            new InputSum(17, [ new Cell(1, 1), new Cell(2, 1), new Cell(2, 2) ]),
            new InputSum(7, [ new Cell(1, 2) ]),
            new InputSum(7, [ new Cell(1, 3), new Cell(1, 4) ]),
            new InputSum(4, [ new Cell(1, 5), new Cell(1, 6) ]),
            new InputSum(11, [ new Cell(1, 7), new Cell(2, 7) ]),
            new InputSum(14, [ new Cell(1, 8), new Cell(2, 8), new Cell(3, 8) ]),
            new InputSum(14, [ new Cell(1, 9), new Cell(2, 9), new Cell(3, 9) ]),
            new InputSum(7, [ new Cell(2, 3), new Cell(2, 4) ]),
            new InputSum(23, [ new Cell(2, 5), new Cell(2, 6), new Cell(3, 4), new Cell(3, 5) ]),
            new InputSum(10, [ new Cell(3, 1), new Cell(3, 2), new Cell(4, 2) ]),
            new InputSum(9, [ new Cell(3, 3) ]),
            new InputSum(13, [ new Cell(3, 6), new Cell(3, 7) ]),

            // big row 2
            new InputSum(17, [ new Cell(4, 1), new Cell(5, 1), new Cell(5, 2) ]),
            new InputSum(14, [ new Cell(4, 3), new Cell(4, 4) ]),
            new InputSum(23, [ new Cell(4, 5), new Cell(5, 5), new Cell(5, 6), new Cell(5, 7) ]),
            new InputSum(5, [ new Cell(4, 6), new Cell(4, 7) ]),
            new InputSum(17, [ new Cell(4, 8), new Cell(4, 9), new Cell(5, 8) ]),
            new InputSum(4, [ new Cell(5, 3), new Cell(5, 4) ]),
            new InputSum(10, [ new Cell(5, 9), new Cell(6, 9) ]),
            new InputSum(16, [ new Cell(6, 1), new Cell(6, 2), new Cell(7, 2) ]),
            new InputSum(15, [ new Cell(6, 3), new Cell(7, 3) ]),
            new InputSum(23, [ new Cell(6, 4), new Cell(6, 5), new Cell(7, 4), new Cell(7, 5) ]),
            new InputSum(10, [ new Cell(6, 6), new Cell(7, 6) ]),
            new InputSum(25, [ new Cell(6, 7), new Cell(7, 7), new Cell(7, 8), new Cell(8, 8) ]),
            new InputSum(6, [ new Cell(6, 8) ]),

            // big row 3
            new InputSum(3, [ new Cell(7, 1), new Cell(8, 1) ]),
            new InputSum(8, [ new Cell(7, 9), new Cell(8, 9) ]),
            new InputSum(27, [ new Cell(8, 2), new Cell(8, 3), new Cell(8, 4), new Cell(9, 3), new Cell(9, 4) ]),
            new InputSum(6, [ new Cell(8, 5), new Cell(9, 5) ]),
            new InputSum(12, [ new Cell(8, 6), new Cell(8, 7), new Cell(9, 6) ]),
            new InputSum(12, [ new Cell(9, 1), new Cell(9, 2) ]),
            new InputSum(16, [ new Cell(9, 7), new Cell(9, 8), new Cell(9, 9) ])
        ]));
    });

    test('Unknown entry', () => {
        expect(() => problemReader('./test/readerUnknownEntry.txt')).toThrow('Unknown entry: a:a');
    });
    
    test('Sum def without value', () => {
        expect(() => problemReader('./test/readerSumDefWithoutValue.txt')).toThrow('Sum def without value: a');
    });
});
