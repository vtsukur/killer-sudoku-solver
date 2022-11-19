import reader from '../src/reader.js';
import { Problem, Sum } from '../src/problem.js';

describe('Reader tests', () => {
    test('Full read - real problem #1', () => {
        const problem = reader('./problems/1.txt');
        expect(problem).toEqual(new Problem([
            // upper subgrids
            Sum.of(17).cell(0, 0).cell(1, 0).cell(1, 1).mk(),
            Sum.of(7).cell(0, 1).mk(),
            Sum.of(7).cell(0, 2).cell(0, 3).mk(),
            Sum.of(4).cell(0, 4).cell(0, 5).mk(),
            Sum.of(11).cell(0, 6).cell(1, 6).mk(),
            Sum.of(14).cell(0, 7).cell(1, 7).cell(2, 7).mk(),
            Sum.of(14).cell(0, 8).cell(1, 8).cell(2, 8).mk(),
            Sum.of(7).cell(1, 2).cell(1, 3).mk(),
            Sum.of(23).cell(1, 4).cell(1, 5).cell(2, 3).cell(2, 4).mk(),
            Sum.of(10).cell(2, 0).cell(2, 1).cell(3, 1).mk(),
            Sum.of(9).cell(2, 2).mk(),
            Sum.of(13).cell(2, 5).cell(2, 6).mk(),

            // middle subgrids
            Sum.of(17).cell(3, 0).cell(4, 0).cell(4, 1).mk(),
            Sum.of(14).cell(3, 2).cell(3, 3).mk(),
            Sum.of(23).cell(3, 4).cell(4, 4).cell(4, 5).cell(4, 6).mk(),
            Sum.of(5).cell(3, 5).cell(3, 6).mk(),
            Sum.of(17).cell(3, 7).cell(3, 8).cell(4, 7).mk(),
            Sum.of(4).cell(4, 2).cell(4, 3).mk(),
            Sum.of(10).cell(4, 8).cell(5, 8).mk(),
            Sum.of(16).cell(5, 0).cell(5, 1).cell(6, 1).mk(),
            Sum.of(15).cell(5, 2).cell(6, 2).mk(),
            Sum.of(23).cell(5, 3).cell(5, 4).cell(6, 3).cell(6, 4).mk(),
            Sum.of(10).cell(5, 5).cell(6, 5).mk(),
            Sum.of(25).cell(5, 6).cell(6, 6).cell(6, 7).cell(7, 7).mk(),
            Sum.of(6).cell(5, 7).mk(),

            // lower subgrids
            Sum.of(3).cell(6, 0).cell(7, 0).mk(),
            Sum.of(8).cell(6, 8).cell(7, 8).mk(),
            Sum.of(27).cell(7, 1).cell(7, 2).cell(7, 3).cell(8, 2).cell(8, 3).mk(),
            Sum.of(6).cell(7, 4).cell(8, 4).mk(),
            Sum.of(12).cell(7, 5).cell(7, 6).cell(8, 5).mk(),
            Sum.of(12).cell(8, 0).cell(8, 1).mk(),
            Sum.of(16).cell(8, 6).cell(8, 7).cell(8, 8).mk()
        ]));
    });

    test('Full read - real problem #2', () => {
        const problem = reader('./problems/2.txt');
        expect(problem).toEqual(new Problem([
            // upper subgrids
            Sum.of(15).cell(0, 0).cell(0, 1).mk(),
            Sum.of(10).cell(0, 2).cell(1, 2).mk(),
            Sum.of(17).cell(0, 3).cell(1, 3).mk(),
            Sum.of(13).cell(0, 4).cell(0, 5).cell(1, 4).mk(),
            Sum.of(7).cell(0, 6).cell(0, 7).mk(),
            Sum.of(11).cell(0, 8).cell(1, 8).mk(),
            Sum.of(7).cell(1, 0).cell(1, 1).mk(),
            Sum.of(10).cell(1, 5).cell(1, 6).cell(1, 7).mk(),
            Sum.of(13).cell(2, 0).cell(2, 1).cell(2, 2).mk(),
            Sum.of(11).cell(2, 3).cell(2, 4).mk(),
            Sum.of(8).cell(2, 5).cell(3, 5).mk(),
            Sum.of(16).cell(2, 6).cell(3, 6).mk(),
            Sum.of(9).cell(2, 7).cell(2, 8).mk(),

            // middle subgrids
            Sum.of(4).cell(3, 0).cell(3, 1).mk(),
            Sum.of(2).cell(3, 2).mk(),
            Sum.of(14).cell(3, 3).cell(3, 4).mk(),
            Sum.of(5).cell(3, 7).cell(4, 7).mk(),
            Sum.of(19).cell(3, 8).cell(4, 8).cell(5, 8).mk(),
            Sum.of(27).cell(4, 0).cell(4, 1).cell(5, 0).cell(5, 1).mk(),
            Sum.of(14).cell(4, 2).cell(5, 2).cell(5, 3).mk(),
            Sum.of(10).cell(4, 3).cell(4, 4).mk(),
            Sum.of(20).cell(4, 5).cell(4, 6).cell(5, 4).cell(5, 5).mk(),
            Sum.of(22).cell(5, 6).cell(5, 7).cell(6, 6).cell(6, 7).mk(),

            // lower subgrids
            Sum.of(19).cell(6, 0).cell(7, 0).cell(8, 0).mk(),
            Sum.of(14).cell(6, 1).cell(7, 1).cell(8, 1).cell(8, 2).mk(),
            Sum.of(15).cell(6, 2).cell(6, 3).cell(7, 2).mk(),
            Sum.of(6).cell(6, 4).cell(6, 5).mk(),
            Sum.of(14).cell(6, 8).cell(7, 8).cell(8, 8).mk(),
            Sum.of(6).cell(7, 3).cell(8, 3).mk(),
            Sum.of(22).cell(7, 4).cell(8, 4).cell(8, 5).mk(),
            Sum.of(8).cell(7, 5).mk(),
            Sum.of(10).cell(7, 6).cell(7, 7).mk(),
            Sum.of(7).cell(8, 6).cell(8, 7).mk()
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
