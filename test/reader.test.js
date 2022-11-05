import reader from '../src/reader.js';
import { Problem, Sum, Cell } from '../src/problem.js';

describe('Reader tests', () => {
    test('Basic read', () => {
        const problem = reader('./test/readerBaseTest.txt');
        expect(problem).toEqual(new Problem([
            new Sum(17, [ new Cell(0, 0), new Cell(0, 1), new Cell(0, 2) ]),
            new Sum(7, [ new Cell(0, 3) ]),
            new Sum(9, [ new Cell(0, 4), new Cell(0, 5) ]),
        ]));
    });

    test('Full read - real problem #1', () => {
        const problem = reader('./problems/1.txt');
        problem.checkCorrectness();
        expect(problem).toEqual(new Problem([
            // upper subgrids
            new Sum(17, [ new Cell(0, 0), new Cell(1, 0), new Cell(1, 1) ]),
            new Sum(7, [ new Cell(0, 1) ]),
            new Sum(7, [ new Cell(0, 2), new Cell(0, 3) ]),
            new Sum(4, [ new Cell(0, 4), new Cell(0, 5) ]),
            new Sum(11, [ new Cell(0, 6), new Cell(1, 6) ]),
            new Sum(14, [ new Cell(0, 7), new Cell(1, 7), new Cell(2, 7) ]),
            new Sum(14, [ new Cell(0, 8), new Cell(1, 8), new Cell(2, 8) ]),
            new Sum(7, [ new Cell(1, 2), new Cell(1, 3) ]),
            new Sum(23, [ new Cell(1, 4), new Cell(1, 5), new Cell(2, 3), new Cell(2, 4) ]),
            new Sum(10, [ new Cell(2, 0), new Cell(2, 1), new Cell(3, 1) ]),
            new Sum(9, [ new Cell(2, 2) ]),
            new Sum(13, [ new Cell(2, 5), new Cell(2, 6) ]),

            // middle subgrids
            new Sum(17, [ new Cell(3, 0), new Cell(4, 0), new Cell(4, 1) ]),
            new Sum(14, [ new Cell(3, 2), new Cell(3, 3) ]),
            new Sum(23, [ new Cell(3, 4), new Cell(4, 4), new Cell(4, 5), new Cell(4, 6) ]),
            new Sum(5, [ new Cell(3, 5), new Cell(3, 6) ]),
            new Sum(17, [ new Cell(3, 7), new Cell(3, 8), new Cell(4, 7) ]),
            new Sum(4, [ new Cell(4, 2), new Cell(4, 3) ]),
            new Sum(10, [ new Cell(4, 8), new Cell(5, 8) ]),
            new Sum(16, [ new Cell(5, 0), new Cell(5, 1), new Cell(6, 1) ]),
            new Sum(15, [ new Cell(5, 2), new Cell(6, 2) ]),
            new Sum(23, [ new Cell(5, 3), new Cell(5, 4), new Cell(6, 3), new Cell(6, 4) ]),
            new Sum(10, [ new Cell(5, 5), new Cell(6, 5) ]),
            new Sum(25, [ new Cell(5, 6), new Cell(6, 6), new Cell(6, 7), new Cell(7, 7) ]),
            new Sum(6, [ new Cell(5, 7) ]),

            // lower subgrids
            new Sum(3, [ new Cell(6, 0), new Cell(7, 0) ]),
            new Sum(8, [ new Cell(6, 8), new Cell(7, 8) ]),
            new Sum(27, [ new Cell(7, 1), new Cell(7, 2), new Cell(7, 3), new Cell(8, 2), new Cell(8, 3) ]),
            new Sum(6, [ new Cell(7, 4), new Cell(8, 4) ]),
            new Sum(12, [ new Cell(7, 5), new Cell(7, 6), new Cell(8, 5) ]),
            new Sum(12, [ new Cell(8, 0), new Cell(8, 1) ]),
            new Sum(16, [ new Cell(8, 6), new Cell(8, 7), new Cell(8, 8) ])
        ]));
    });

    test('Full read - real problem #2', () => {
        const problem = reader('./problems/2.txt');
        problem.checkCorrectness();
        expect(problem).toEqual(new Problem([
            // upper subgrids
            new Sum(15, [ new Cell(0, 0), new Cell(0, 1) ]),
            new Sum(10, [ new Cell(0, 2), new Cell(1, 2) ]),
            new Sum(17, [ new Cell(0, 3), new Cell(1, 3) ]),
            new Sum(13, [ new Cell(0, 4), new Cell(0, 5), new Cell(1, 4) ]),
            new Sum(7, [ new Cell(0, 6), new Cell(0, 7) ]),
            new Sum(11, [ new Cell(0, 8), new Cell(1, 8) ]),
            new Sum(7, [ new Cell(1, 0), new Cell(1, 1) ]),
            new Sum(10, [ new Cell(1, 5), new Cell(1, 6), new Cell(1, 7) ]),
            new Sum(13, [ new Cell(2, 0), new Cell(2, 1), new Cell(2, 2) ]),
            new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]),
            new Sum(8, [ new Cell(2, 5), new Cell(3, 5) ]),
            new Sum(16, [ new Cell(2, 6), new Cell(3, 6) ]),
            new Sum(9, [ new Cell(2, 7), new Cell(2, 8) ]),

            // middle subgrids
            new Sum(4, [ new Cell(3, 0), new Cell(3, 1) ]),
            new Sum(2, [ new Cell(3, 2) ]),
            new Sum(14, [ new Cell(3, 3), new Cell(3, 4) ]),
            new Sum(5, [ new Cell(3, 7), new Cell(4, 7) ]),
            new Sum(19, [ new Cell(3, 8), new Cell(4, 8), new Cell(5, 8) ]),
            new Sum(27, [ new Cell(4, 0), new Cell(4, 1), new Cell(5, 0), new Cell(5, 1) ]),
            new Sum(14, [ new Cell(4, 2), new Cell(5, 2), new Cell(5, 3) ]),
            new Sum(10, [ new Cell(4, 3), new Cell(4, 4) ]),
            new Sum(20, [ new Cell(4, 5), new Cell(4, 6), new Cell(5, 4), new Cell(5, 5) ]),
            new Sum(22, [ new Cell(5, 6), new Cell(5, 7), new Cell(6, 6), new Cell(6, 7) ]),

            // lower subgrids
            new Sum(19, [ new Cell(6, 0), new Cell(7, 0), new Cell(8, 0) ]),
            new Sum(14, [ new Cell(6, 1), new Cell(7, 1), new Cell(8, 1), new Cell(8, 2) ]),
            new Sum(15, [ new Cell(6, 2), new Cell(6, 3), new Cell(7, 2)  ]),
            new Sum(6, [ new Cell(6, 4), new Cell(6, 5) ]),
            new Sum(14, [ new Cell(6, 8), new Cell(7, 8), new Cell(8, 8) ]),
            new Sum(6, [ new Cell(7, 3), new Cell(8, 3) ]),
            new Sum(22, [ new Cell(7, 4), new Cell(8, 4), new Cell(8, 5) ]),
            new Sum(8, [ new Cell(7, 5) ]),
            new Sum(10, [ new Cell(7, 6), new Cell(7, 7) ]),
            new Sum(7, [ new Cell(8, 6), new Cell(8, 7) ])
        ]));
    });

    test('Unknown entry', () => {
        expect(() => reader('./test/readerUnknownEntry.txt')).toThrow('Unknown entry: a:a');
    });
    
    test('Sum def without value', () => {
        expect(() => reader('./test/readerSumDefWithoutValue.txt')).toThrow('Sum def without value: a');
    });
    
    test('Sum def duplicate', () => {
        expect(() => reader('./test/readerSumDefDuplication.txt')).toThrow('Sum def duplicate: a');
    });
});
