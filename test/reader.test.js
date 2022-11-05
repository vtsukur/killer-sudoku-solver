import reader from '../src/reader.js';
import { Problem, Sum, Cell } from '../src/problem.js';

describe('Reader tests', () => {
    test('Basic read', () => {
        const problem = reader('./test/readerBaseTest.txt');
        expect(problem).toEqual(new Problem([
            Sum.of(17).in(0, 0).in(0, 1).in(0, 2).mk(),
            Sum.of(7).in(0, 3).mk(),
            Sum.of(9).in(0, 4).in(0, 5).mk(),
        ]));
    });

    test('Full read - real problem #1', () => {
        const problem = reader('./problems/1.txt');
        problem.checkCorrectness();
        expect(problem).toEqual(new Problem([
            // upper subgrids
            Sum.of(17).in(0, 0).in(1, 0).in(1, 1).mk(),
            Sum.of(7).in(0, 1).mk(),
            Sum.of(7).in(0, 2).in(0, 3).mk(),
            Sum.of(4).in(0, 4).in(0, 5).mk(),
            Sum.of(11).in(0, 6).in(1, 6).mk(),
            Sum.of(14).in(0, 7).in(1, 7).in(2, 7).mk(),
            Sum.of(14).in(0, 8).in(1, 8).in(2, 8).mk(),
            Sum.of(7).in(1, 2).in(1, 3).mk(),
            Sum.of(23).in(1, 4).in(1, 5).in(2, 3).in(2, 4).mk(),
            Sum.of(10).in(2, 0).in(2, 1).in(3, 1).mk(),
            Sum.of(9).in(2, 2).mk(),
            Sum.of(13).in(2, 5).in(2, 6).mk(),

            // middle subgrids
            Sum.of(17).in(3, 0).in(4, 0).in(4, 1).mk(),
            Sum.of(14).in(3, 2).in(3, 3).mk(),
            Sum.of(23).in(3, 4).in(4, 4).in(4, 5).in(4, 6).mk(),
            Sum.of(5).in(3, 5).in(3, 6).mk(),
            Sum.of(17).in(3, 7).in(3, 8).in(4, 7).mk(),
            Sum.of(4).in(4, 2).in(4, 3).mk(),
            Sum.of(10).in(4, 8).in(5, 8).mk(),
            Sum.of(16).in(5, 0).in(5, 1).in(6, 1).mk(),
            Sum.of(15).in(5, 2).in(6, 2).mk(),
            Sum.of(23).in(5, 3).in(5, 4).in(6, 3).in(6, 4).mk(),
            Sum.of(10).in(5, 5).in(6, 5).mk(),
            Sum.of(25).in(5, 6).in(6, 6).in(6, 7).in(7, 7).mk(),
            Sum.of(6).in(5, 7).mk(),

            // lower subgrids
            Sum.of(3).in(6, 0).in(7, 0).mk(),
            Sum.of(8).in(6, 8).in(7, 8).mk(),
            Sum.of(27).in(7, 1).in(7, 2).in(7, 3).in(8, 2).in(8, 3).mk(),
            Sum.of(6).in(7, 4).in(8, 4).mk(),
            Sum.of(12).in(7, 5).in(7, 6).in(8, 5).mk(),
            Sum.of(12).in(8, 0).in(8, 1).mk(),
            Sum.of(16).in(8, 6).in(8, 7).in(8, 8).mk()
        ]));
    });

    test('Full read - real problem #2', () => {
        const problem = reader('./problems/2.txt');
        problem.checkCorrectness();
        expect(problem).toEqual(new Problem([
            // upper subgrids
            Sum.of(15).in(0, 0).in(0, 1).mk(),
            Sum.of(10).in(0, 2).in(1, 2).mk(),
            Sum.of(17).in(0, 3).in(1, 3).mk(),
            Sum.of(13).in(0, 4).in(0, 5).in(1, 4).mk(),
            Sum.of(7).in(0, 6).in(0, 7).mk(),
            Sum.of(11).in(0, 8).in(1, 8).mk(),
            Sum.of(7).in(1, 0).in(1, 1).mk(),
            Sum.of(10).in(1, 5).in(1, 6).in(1, 7).mk(),
            Sum.of(13).in(2, 0).in(2, 1).in(2, 2).mk(),
            Sum.of(11).in(2, 3).in(2, 4).mk(),
            Sum.of(8).in(2, 5).in(3, 5).mk(),
            Sum.of(16).in(2, 6).in(3, 6).mk(),
            Sum.of(9).in(2, 7).in(2, 8).mk(),

            // middle subgrids
            Sum.of(4).in(3, 0).in(3, 1).mk(),
            Sum.of(2).in(3, 2).mk(),
            Sum.of(14).in(3, 3).in(3, 4).mk(),
            Sum.of(5).in(3, 7).in(4, 7).mk(),
            Sum.of(19).in(3, 8).in(4, 8).in(5, 8).mk(),
            Sum.of(27).in(4, 0).in(4, 1).in(5, 0).in(5, 1).mk(),
            Sum.of(14).in(4, 2).in(5, 2).in(5, 3).mk(),
            Sum.of(10).in(4, 3).in(4, 4).mk(),
            Sum.of(20).in(4, 5).in(4, 6).in(5, 4).in(5, 5).mk(),
            Sum.of(22).in(5, 6).in(5, 7).in(6, 6).in(6, 7).mk(),

            // lower subgrids
            Sum.of(19).in(6, 0).in(7, 0).in(8, 0).mk(),
            Sum.of(14).in(6, 1).in(7, 1).in(8, 1).in(8, 2).mk(),
            Sum.of(15).in(6, 2).in(6, 3).in(7, 2).mk(),
            Sum.of(6).in(6, 4).in(6, 5).mk(),
            Sum.of(14).in(6, 8).in(7, 8).in(8, 8).mk(),
            Sum.of(6).in(7, 3).in(8, 3).mk(),
            Sum.of(22).in(7, 4).in(8, 4).in(8, 5).mk(),
            Sum.of(8).in(7, 5).mk(),
            Sum.of(10).in(7, 6).in(7, 7).mk(),
            Sum.of(7).in(8, 6).in(8, 7).mk()
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
