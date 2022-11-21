import _ from 'lodash';
import { Cell } from '../../src/problem/cell';
import { Cage } from '../../src/problem/cage';

describe('Cage tests', () => {
    test('Construction of cage storing sum and cells', () => {
        const cage = new Cage(10, [ Cell.at(4, 4), Cell.at(4, 5) ]);
        expect(cage.sum).toBe(10);
        expect(cage.cellCount).toBe(2);
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
    });

    test('Construction of cage using builder', () => {
        const cage = Cage.ofSum(10).at(4, 4).at(4, 5).mk();
        expect(cage.sum).toBe(10);
        expect(cage.cellCount).toBe(2);
        expect(cage.cells).toEqual([ Cell.at(4, 4), Cell.at(4, 5) ]);
    });

    test('Construction of invalid cage with a duplicate cell', () => {
        expect(() => Cage.ofSum(9).at(4, 4).at(4, 4).mk()).toThrow(
            'Invalid cage. 1 duplicate cell(s): (4, 4)'
        );
    });

    test('Construction of invalid cage with 2 duplicate cells', () => {
        expect(() => Cage.ofSum(9).at(0, 0).at(0, 1).at(0, 0).at(0, 1).mk()).toThrow(
            'Invalid cage. 2 duplicate cell(s): (0, 0), (0, 1)'
        );
    });

    test('Construction of invalid cage with more than 9 cells (cage cannot be bigger than a house)', () => {
        expect(() => Cage.ofSum(46)
                .at(0, 0).at(0, 1).at(0, 2).at(0, 3).at(0, 4).at(0, 5).at(0, 6).at(0, 7).at(0, 8)
                .at(1, 0)
                .mk()).toThrow(
            'Invalid cage. Cell count should be <= 9. Actual cell count: 10'
        );
    });

    test('Cage key', () => {
        expect(new Cage(10, [ Cell.at(4, 4), Cell.at(4, 5) ]).key).toBe(
            '10 [(4, 4), (4, 5)]');
    });

    test('Cage toString', () => {
        expect(new Cage(10, [ Cell.at(4, 4), Cell.at(4, 5) ]).toString()).toBe(
            '10 [(4, 4), (4, 5)]');
    });
});
