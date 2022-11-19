import _ from 'lodash';
import { Cell } from '../../src/problem/cell';
import { Cage } from '../../src/problem/cage';

describe('Cage tests', () => {
    test('Cage creation', () => {
        const cage = new Cage(10, [ new Cell(4, 4), new Cell(4, 5) ]);
        expect(cage.sum).toBe(10);
        expect(cage.cellCount).toBe(2);
        expect(cage.cells).toEqual([ new Cell(4, 4), new Cell(4, 5) ]);
    });

    test('Cage creation via builder', () => {
        const cage = Cage.of(10).cell(4, 4).cell(4, 5).mk();
        expect(cage.sum).toBe(10);
        expect(cage.cellCount).toBe(2);
        expect(cage.cells).toEqual([ new Cell(4, 4), new Cell(4, 5) ]);
    });

    test('Cage within rowSolver', () => {
        expect(Cage.of(10).cell(4, 4).mk().isWithinRow).toBe(true);
        expect(Cage.of(10).cell(4, 4).cell(4, 5).mk().isWithinRow).toBe(true);
    });

    test('Cage not within rowSolver', () => {
        expect(Cage.of(10).cell(4, 4).cell(5, 4).mk().isWithinRow).toBe(false);
    });

    test('Cage within columnSolver', () => {
        expect(Cage.of(10).cell(5, 5).mk().isWithinColumn).toBe(true);
        expect(Cage.of(10).cell(5, 5).cell(6, 5).mk().isWithinColumn).toBe(true);
    });

    test('Cage not within columnSolver', () => {
        expect(Cage.of(10).cell(5, 5).cell(5, 6).mk().isWithinColumn).toBe(false);
    });

    test('Cage within nonetSolver', () => {
        expect(Cage.of(10).cell(6, 6).mk().isWithinSubgrid).toBe(true);
        expect(Cage.of(10).cell(6, 6).cell(6, 7).cell(6, 8).mk().isWithinSubgrid).toBe(true);
    });

    test('Cage not within nonetSolver', () => {
        expect(Cage.of(10).cell(5, 6).cell(6, 6).mk().isWithinSubgrid).toBe(false);
    });

    test('Cage not within rowSolver neither columnSolver nor nonetSolver', () => {
        const cage = Cage.of(10).cell(5, 6).cell(6, 6).cell(6, 5).mk();
        expect(cage.isWithinRow).toBe(false);
        expect(cage.isWithinColumn).toBe(false);
        expect(cage.isWithinSubgrid).toBe(false);
    });

    test('Cage key', () => {
        expect(new Cage(10, [ new Cell(4, 4), new Cell(4, 5) ]).key()).toBe(
            "10 [(4, 4), (4, 5)]");
    });

    test('Cage toString', () => {
        expect(new Cage(10, [ new Cell(4, 4), new Cell(4, 5) ]).toString()).toBe(
            "10 [(4, 4), (4, 5)]");
    });
});
