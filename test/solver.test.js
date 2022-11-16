import _ from 'lodash';
import { Cell, Sum, GRID_CELL_COUNT, UNIQUE_SEGMENT_COUNT, UNIQUE_SEGMENT_LENGTH } from '../src/problem';
import { Solver } from '../src/solver';
import { killerSudokuBySudokuDotCom_2022_10_19, killerSudokuBySudokuDotCom_2022_10_22, killerSudokuBySudokuDotCom_2022_10_25, killerSudokuBySudokuDotCom_2022_11_01, killerSudokuBySudokuDotCom_2022_11_10 } from './realKillerSudokuProblems';

describe('Tests for solver', () => {
    test('Create solver (shallow coverage)', () => {
        const solver = new Solver(killerSudokuBySudokuDotCom_2022_11_01);

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

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-10-19)', () => {
        const solver = new Solver(killerSudokuBySudokuDotCom_2022_10_19);
        const solution = solver.solve();

        // expect(solution).toEqual([
        //     [ 5, 6, 1, 3, 7, 4, 8, 2, 9 ],
        //     [ 3, 7, 8, 9, 6, 2, 5, 1, 4 ],
        //     [ 4, 2, 9, 1, 8, 5, 3, 6, 7 ],
        //     [ 1, 9, 6, 7, 5, 3, 4, 8, 2 ],
        //     [ 7, 4, 5, 2, 1, 8, 6, 9, 3 ],
        //     [ 8, 3, 2, 4, 9, 6, 7, 5, 1 ],
        //     [ 9, 8, 4, 5, 3, 1, 2, 7, 6 ],
        //     [ 2, 5, 7, 6, 4, 9, 1, 3, 8 ],
        //     [ 6, 1, 3, 8, 2, 7, 9, 4, 5 ]
        // ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-10-22)', () => {
        const solver = new Solver(killerSudokuBySudokuDotCom_2022_10_22);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 5, 6, 1, 3, 7, 4, 8, 2, 9 ],
            [ 3, 7, 8, 9, 6, 2, 5, 1, 4 ],
            [ 4, 2, 9, 1, 8, 5, 3, 6, 7 ],
            [ 1, 9, 6, 7, 5, 3, 4, 8, 2 ],
            [ 7, 4, 5, 2, 1, 8, 6, 9, 3 ],
            [ 8, 3, 2, 4, 9, 6, 7, 5, 1 ],
            [ 9, 8, 4, 5, 3, 1, 2, 7, 6 ],
            [ 2, 5, 7, 6, 4, 9, 1, 3, 8 ],
            [ 6, 1, 3, 8, 2, 7, 9, 4, 5 ]
        ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-10-25)', () => {
        const solver = new Solver(killerSudokuBySudokuDotCom_2022_10_25);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 6, 5, 8, 4, 7, 9, 1, 2, 3 ],
            [ 7, 4, 3, 1, 6, 2, 5, 8, 9 ],
            [ 2, 9, 1, 5, 3, 8, 7, 4, 6 ],
            [ 5, 8, 6, 9, 1, 3, 4, 7, 2 ],
            [ 3, 2, 4, 6, 8, 7, 9, 5, 1 ],
            [ 1, 7, 9, 2, 5, 4, 6, 3, 8 ],
            [ 9, 6, 2, 3, 4, 5, 8, 1, 7 ],
            [ 8, 1, 5, 7, 2, 6, 3, 9, 4 ],
            [ 4, 3, 7, 8, 9, 1, 2, 6, 5 ]
        ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-11-01)', () => {
        const solver = new Solver(killerSudokuBySudokuDotCom_2022_11_01);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 8, 7, 1, 9, 2, 6, 4, 3, 5 ],
            [ 3, 4, 9, 8, 5, 1, 2, 7, 6 ],
            [ 2, 5, 6, 4, 7, 3, 9, 8, 1 ],
            [ 1, 3, 2, 6, 8, 5, 7, 4, 9 ],
            [ 5, 9, 8, 7, 3, 4, 6, 1, 2 ],
            [ 7, 6, 4, 2, 1, 9, 3, 5, 8 ],
            [ 9, 1, 5, 3, 4, 2, 8, 6, 7 ],
            [ 4, 2, 7, 5, 6, 8, 1, 9, 3 ],
            [ 6, 8, 3, 1, 9, 7, 5, 2, 4 ],
        ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-11-10)', () => {
        const solver = new Solver(killerSudokuBySudokuDotCom_2022_11_10);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 2, 5, 6, 4, 7, 3, 8, 9, 1 ],
            [ 8, 7, 1, 9, 2, 6, 3, 4, 5 ],
            [ 3, 4, 9, 8, 5, 1, 7, 2, 6 ],
            [ 4, 2, 7, 5, 6, 8, 9, 1, 3 ],
            [ 9, 1, 5, 3, 4, 2, 6, 8, 7 ],
            [ 6, 8, 3, 1, 9, 7, 2, 5, 4 ],
            [ 5, 9, 8, 7, 3, 4, 1, 6, 2 ],
            [ 1, 3, 2, 6, 8, 5, 4, 7, 9 ],
            [ 7, 6, 4, 2, 1, 9, 5, 3, 8 ]
        ]);
    });

    test('Find solution (whitebox verification)', () => {
        const solver = new Solver(killerSudokuBySudokuDotCom_2022_11_01);
        solver.solve();

        expect(solver.cellDeterminatorAt(2, 7).placedNumber).toBe(8);
        expect(solver.cellDeterminatorAt(2, 7).solved).toBe(true);

        _.range(UNIQUE_SEGMENT_LENGTH).forEach(idx => {
            expect(solver.rows[idx].sums.length).toBe(UNIQUE_SEGMENT_LENGTH);
            expect(solver.columns[idx].sums.length).toBe(UNIQUE_SEGMENT_LENGTH);
            expect(solver.subgrids[idx].sums.length).toBe(UNIQUE_SEGMENT_LENGTH);
        });
    });
});
