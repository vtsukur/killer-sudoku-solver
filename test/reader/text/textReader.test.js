import reader from '../../../src/reader/text/textReader.js';
import { Puzzle } from '../../../src/puzzle/puzzle';
import { Cage } from '../../../src/puzzle/cage';

describe('Reader tests', () => {
    test('Full read - real puzzle #1', () => {
        const puzzle = reader('./test/reader/text/samples/1.txt');
        expect(puzzle).toEqual(new Puzzle([
            // upper nonets
            Cage.ofSum(17).at(0, 0).at(1, 0).at(1, 1).mk(),
            Cage.ofSum(7).at(0, 1).mk(),
            Cage.ofSum(7).at(0, 2).at(0, 3).mk(),
            Cage.ofSum(4).at(0, 4).at(0, 5).mk(),
            Cage.ofSum(11).at(0, 6).at(1, 6).mk(),
            Cage.ofSum(14).at(0, 7).at(1, 7).at(2, 7).mk(),
            Cage.ofSum(14).at(0, 8).at(1, 8).at(2, 8).mk(),
            Cage.ofSum(7).at(1, 2).at(1, 3).mk(),
            Cage.ofSum(23).at(1, 4).at(1, 5).at(2, 3).at(2, 4).mk(),
            Cage.ofSum(10).at(2, 0).at(2, 1).at(3, 1).mk(),
            Cage.ofSum(9).at(2, 2).mk(),
            Cage.ofSum(13).at(2, 5).at(2, 6).mk(),

            // middle nonets
            Cage.ofSum(17).at(3, 0).at(4, 0).at(4, 1).mk(),
            Cage.ofSum(14).at(3, 2).at(3, 3).mk(),
            Cage.ofSum(23).at(3, 4).at(4, 4).at(4, 5).at(4, 6).mk(),
            Cage.ofSum(5).at(3, 5).at(3, 6).mk(),
            Cage.ofSum(17).at(3, 7).at(3, 8).at(4, 7).mk(),
            Cage.ofSum(4).at(4, 2).at(4, 3).mk(),
            Cage.ofSum(10).at(4, 8).at(5, 8).mk(),
            Cage.ofSum(16).at(5, 0).at(5, 1).at(6, 1).mk(),
            Cage.ofSum(15).at(5, 2).at(6, 2).mk(),
            Cage.ofSum(23).at(5, 3).at(5, 4).at(6, 3).at(6, 4).mk(),
            Cage.ofSum(10).at(5, 5).at(6, 5).mk(),
            Cage.ofSum(25).at(5, 6).at(6, 6).at(6, 7).at(7, 7).mk(),
            Cage.ofSum(6).at(5, 7).mk(),

            // lower nonets
            Cage.ofSum(3).at(6, 0).at(7, 0).mk(),
            Cage.ofSum(8).at(6, 8).at(7, 8).mk(),
            Cage.ofSum(27).at(7, 1).at(7, 2).at(7, 3).at(8, 2).at(8, 3).mk(),
            Cage.ofSum(6).at(7, 4).at(8, 4).mk(),
            Cage.ofSum(12).at(7, 5).at(7, 6).at(8, 5).mk(),
            Cage.ofSum(12).at(8, 0).at(8, 1).mk(),
            Cage.ofSum(16).at(8, 6).at(8, 7).at(8, 8).mk()
        ]));
    });

    test('Full read - real puzzle #2', () => {
        const puzzle = reader('./test/reader/text/samples/2.txt');
        expect(puzzle).toEqual(new Puzzle([
            // upper nonets
            Cage.ofSum(15).at(0, 0).at(0, 1).mk(),
            Cage.ofSum(10).at(0, 2).at(1, 2).mk(),
            Cage.ofSum(17).at(0, 3).at(1, 3).mk(),
            Cage.ofSum(13).at(0, 4).at(0, 5).at(1, 4).mk(),
            Cage.ofSum(7).at(0, 6).at(0, 7).mk(),
            Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
            Cage.ofSum(7).at(1, 0).at(1, 1).mk(),
            Cage.ofSum(10).at(1, 5).at(1, 6).at(1, 7).mk(),
            Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).mk(),
            Cage.ofSum(11).at(2, 3).at(2, 4).mk(),
            Cage.ofSum(8).at(2, 5).at(3, 5).mk(),
            Cage.ofSum(16).at(2, 6).at(3, 6).mk(),
            Cage.ofSum(9).at(2, 7).at(2, 8).mk(),

            // middle nonets
            Cage.ofSum(4).at(3, 0).at(3, 1).mk(),
            Cage.ofSum(2).at(3, 2).mk(),
            Cage.ofSum(14).at(3, 3).at(3, 4).mk(),
            Cage.ofSum(5).at(3, 7).at(4, 7).mk(),
            Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).mk(),
            Cage.ofSum(27).at(4, 0).at(4, 1).at(5, 0).at(5, 1).mk(),
            Cage.ofSum(14).at(4, 2).at(5, 2).at(5, 3).mk(),
            Cage.ofSum(10).at(4, 3).at(4, 4).mk(),
            Cage.ofSum(20).at(4, 5).at(4, 6).at(5, 4).at(5, 5).mk(),
            Cage.ofSum(22).at(5, 6).at(5, 7).at(6, 6).at(6, 7).mk(),

            // lower nonets
            Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).mk(),
            Cage.ofSum(14).at(6, 1).at(7, 1).at(8, 1).at(8, 2).mk(),
            Cage.ofSum(15).at(6, 2).at(6, 3).at(7, 2).mk(),
            Cage.ofSum(6).at(6, 4).at(6, 5).mk(),
            Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).mk(),
            Cage.ofSum(6).at(7, 3).at(8, 3).mk(),
            Cage.ofSum(22).at(7, 4).at(8, 4).at(8, 5).mk(),
            Cage.ofSum(8).at(7, 5).mk(),
            Cage.ofSum(10).at(7, 6).at(7, 7).mk(),
            Cage.ofSum(7).at(8, 6).at(8, 7).mk()
        ]));
    });

    test('Unknown entry', () => {
        expect(() => reader('./test/reader/text/samples/unknownEntry.txt')).toThrow('Unknown entry: a:a');
    });
    
    test('Cage def without sum', () => {
        expect(() => reader('./test/reader/text/samples/cageWithoutValue.txt')).toThrow('Cage def without sum: a');
    });
    
    test('Cage def duplicate', () => {
        expect(() => reader('./test/reader/text/samples/cageDuplication.txt')).toThrow('Cage def duplicate: a');
    });
});
