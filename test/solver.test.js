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

    test('Determine and slice residual sums in segments (shallow coverage)', () => {
        const solver = new Solver(testProblem);

        solver.determineAndSliceResidualSumsInSegments();

        const cell_0_0_Determinator = solver.cellDeterminatorAt(0, 0);
        expect(cell_0_0_Determinator.withinSumsSet).toEqual(new Set([
            solver.inputSumAt(0, 0),
            // residual sum of column 0
            Sum.of(26).cell(0, 0).cell(1, 0).cell(2, 0).cell(3, 0).cell(4, 0).cell(5, 0).mk()
        ]));

        const cell_1_5_Determinator = solver.cellDeterminatorAt(1, 5);
        expect(cell_1_5_Determinator.withinSumsSet).toEqual(new Set([
            solver.inputSumAt(1, 5),
            // residual sum of column 1
            Sum.of(29).cell(0, 5).cell(1, 5).cell(4, 5).cell(5, 5).cell(6, 5).cell(8, 5).mk(),
            // residual sum of subgrid 1
            Sum.of(4).cell(1, 5).cell(2, 5).mk()
        ]));

        const cell_0_2_Determinator = solver.cellDeterminatorAt(0, 2);
        expect(cell_0_2_Determinator.withinSumsSet).toEqual(new Set([
            solver.inputSumAt(0, 2),
            // residual sum of row 0
            Sum.of(23).cell(0, 2).cell(0, 3).cell(0, 4).cell(0, 5).cell(0, 8).mk()
        ]));

        const cell_2_6_Determinator = solver.cellDeterminatorAt(2, 6);
        expect(cell_2_6_Determinator.withinSumsSet).toEqual(new Set([
            solver.inputSumAt(2, 6),
            // residual sum of row 2
            Sum.of(12).cell(2, 5).cell(2, 6).mk(),
            // residual sum of subgrid 2
            Sum.of(18).cell(1, 6).cell(1, 7).cell(2, 6).mk()
        ]));

        // const cell_5_6_Determinator = solver.cellDeterminatorAt(5, 6);
        // expect(cell_5_6_Determinator.withinSumsSet).toEqual(new Set([
        //     // sliced sum
        //     Sum.of(8).cell(5, 6).cell(5, 7),
        //     // residual sum of column 6
        //     Sum.of(29).cell(0, 6).cell(1, 6).cell(4, 6).cell(5, 6).cell(6, 6).cell(7, 6).cell(8, 6).mk()
        // ]));
        // // expect(cell_5_6_Determinator.withinSumsSet).toEqual(new Set([
        // //     solver.inputSumAt(5, 6),
        // //     // residual sum of row 5
        // //     new Sum(45, _.range(UNIQUE_SEGMENT_LENGTH).map(colIdx => new Cell(5, colIdx))),
        // //     // residual sum of column 6
        // //     Sum.of(29).cell(0, 6).cell(1, 6).cell(4, 6).cell(5, 6).cell(6, 6).cell(7, 6).cell(8, 6).mk(),
        // //     // residual sum of subgrid 5
        // //     Sum.of(21).cell(3, 6).cell(4, 6).cell(5, 6).cell(5, 7).mk()
        // // ]));

        const cell_3_2_Determinator = solver.cellDeterminatorAt(3, 2);
        expect(cell_3_2_Determinator.withinSumsSet).toEqual(new Set([
            solver.inputSumAt(3, 2)
        ]));
    });
});
