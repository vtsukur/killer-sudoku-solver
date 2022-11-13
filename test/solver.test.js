import _ from 'lodash';
import { Cell, Sum, GRID_CELL_COUNT, UNIQUE_SEGMENT_COUNT, UNIQUE_SEGMENT_LENGTH } from '../src/problem';
import { Solver } from '../src/solver';
import testProblem from './testProblem';

describe('Tests for solver', () => {
    test('Create solver (shallow coverage)', () => {
        const solver = new Solver(testProblem);

        expect(solver.problem.cells.length).toBe(GRID_CELL_COUNT);
        expect(solver.problem.cells[21]).toEqual(new Cell(2, 3));
        expect(solver.cellAt(2, 3)).toEqual(new Cell(2, 3));
        expect(solver.inputSums.length).toBe(33);
        expect(solver.inputSums[9]).toEqual(Sum.of(11).cell(2, 3).cell(2, 4).mk());
        expect(solver.inputSumAt(2, 3)).toEqual(Sum.of(11).cell(2, 3).cell(2, 4).mk());
        expect(solver.rows.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solver.rows[2].sums[1]).toEqual(Sum.of(11).cell(2, 3).cell(2, 4).mk());
        expect(solver.columns.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solver.columns[2].sums[1]).toEqual(Sum.of(2).cell(3, 2).mk());
        expect(solver.subgrids.length).toBe(UNIQUE_SEGMENT_COUNT);
        expect(solver.subgrids[1].sums[2]).toEqual(Sum.of(11).cell(2, 3).cell(2, 4).mk());

        const aCellDeterminator = solver.cellDeterminatorAt(2, 3);
        expect(aCellDeterminator.cell).toEqual(new Cell(2, 3));
        expect(aCellDeterminator.row.idx).toEqual(2);
        expect(aCellDeterminator.column.idx).toEqual(3);
        expect(aCellDeterminator.subgrid.idx).toEqual(1);
        expect(aCellDeterminator.placedNumber).toBe(undefined);
        expect(aCellDeterminator.numberOptions).toEqual(new Set([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]));
        expect(aCellDeterminator.withinSumsSet).toEqual(new Set([ solver.inputSumAt(2, 3) ]));
    });

    test('Find solution', () => {
        const solver = new Solver(testProblem);

        const solution = solver.solve();

        // black box verification
        const NA = undefined;
        expect(solution).toEqual([
            [ NA, NA,  1,  9, NA, NA, NA, NA, NA ],
            [ NA, NA,  9,  8, NA,  1, NA, NA, NA ],
            [ NA, NA,  6,  4,  7,  3,  9,  8,  1 ],
            [ NA, NA,  2,  6,  8,  5,  7,  4,  9 ],
            [ NA, NA, NA,  7,  3, NA,  6,  1, NA ],
            [ NA, NA, NA,  2,  1, NA, NA, NA, NA ],
            [ NA, NA, NA,  3, NA, NA, NA, NA, NA ],
            [ NA, NA, NA, NA, NA,  8, NA, NA, NA ],
            [ NA, NA,  3, NA, NA,  7, NA, NA, NA ],
        ]);

        // white box verification
        expect(solver.cellDeterminatorAt(2, 7).placedNumber).toBe(8);
        expect(solver.cellDeterminatorAt(2, 7).solved).toBe(true);
    });
});
