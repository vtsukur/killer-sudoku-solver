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

    test('Construction of invalid cage with duplicate cell', () => {
        expect(() => Cage.ofSum(9).at(4, 4).at(4, 4).mk()).toThrow(
            'Invalid cage. 1 duplicate cell(s): (4, 4)'
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
