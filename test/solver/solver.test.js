import _ from 'lodash';
import { GRID_CELL_COUNT, UNIQUE_SEGMENT_LENGTH } from '../../src/problem/constants';
import { Cell } from '../../src/problem/cell';
import { Cage } from '../../src/problem/cage';
import { Solver } from '../../src/solver/solver';
import { sudokuDotCom_dailyChallengeOf_2022_04_06, sudokuDotCom_dailyChallengeOf_2022_08_12, sudokuDotCom_dailyChallengeOf_2022_08_30, sudokuDotCom_dailyChallengeOf_2022_10_18, sudokuDotCom_dailyChallengeOf_2022_10_19, sudokuDotCom_dailyChallengeOf_2022_10_22, sudokuDotCom_dailyChallengeOf_2022_10_25, sudokuDotCom_dailyChallengeOf_2022_11_01, sudokuDotCom_dailyChallengeOf_2022_11_10, sudokuDotCom_randomExpertLevelChallenge } from '../problem/realProblemSamples';

describe('Tests for solver', () => {
    test('Create solver (shallow coverage)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        expect(solver.problem.cells.length).toBe(GRID_CELL_COUNT);
        expect(solver.problem.cells[21]).toEqual(new Cell(2, 3));
        expect(solver.cellAt(2, 3)).toEqual(new Cell(2, 3));
        expect(solver.inputCages.length).toBe(33);
        expect(solver.inputCages[9]).toEqual(Cage.of(11).cell(2, 3).cell(2, 4).mk());
        expect(solver.inputCageAt(2, 3)).toEqual(Cage.of(11).cell(2, 3).cell(2, 4).mk());
        expect(solver.rows.length).toBe(UNIQUE_SEGMENT_LENGTH);
        expect(solver.rows[2].cages[1]).toEqual(Cage.of(11).cell(2, 3).cell(2, 4).mk());
        expect(solver.columns.length).toBe(UNIQUE_SEGMENT_LENGTH);
        expect(solver.columns[2].cages[1]).toEqual(Cage.of(2).cell(3, 2).mk());
        expect(solver.subgrids.length).toBe(UNIQUE_SEGMENT_LENGTH);
        expect(solver.subgrids[1].cages[2]).toEqual(Cage.of(11).cell(2, 3).cell(2, 4).mk());

        const aCellDeterminator = solver.cellSolverAt(2, 3);
        expect(aCellDeterminator.cell).toEqual(new Cell(2, 3));
        expect(aCellDeterminator.row.idx).toEqual(2);
        expect(aCellDeterminator.column.idx).toEqual(3);
        expect(aCellDeterminator.subgrid.idx).toEqual(1);
        expect(aCellDeterminator.placedNumber).toBe(undefined);
        expect(aCellDeterminator.numOpts()).toEqual(new Set([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]));
        expect(aCellDeterminator.withinCagesSet).toEqual(new Set([ solver.inputCageAt(2, 3) ]));
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-04-06)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_04_06);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 4, 3, 7, 8, 9, 1, 6, 2, 5 ],
            [ 8, 1, 5, 7, 2, 6, 9, 3, 4 ],
            [ 9, 6, 2, 3, 4, 5, 1, 8, 7 ],
            [ 5, 8, 6, 9, 1, 3, 7, 4, 2 ],
            [ 3, 2, 4, 6, 8, 7, 5, 9, 1 ],
            [ 1, 7, 9, 2, 5, 4, 3, 6, 8 ],
            [ 2, 9, 1, 5, 3, 8, 4, 7, 6 ],
            [ 7, 4, 3, 1, 6, 2, 8, 5, 9 ],
            [ 6, 5, 8, 4, 7, 9, 2, 1, 3 ]
        ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-08-12)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_08_12);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 1, 3, 2, 9, 4, 7, 6, 8, 5 ],
            [ 5, 9, 8, 2, 1, 6, 7, 3, 4 ],
            [ 7, 6, 4, 8, 5, 3, 2, 1, 9 ],
            [ 4, 2, 7, 3, 9, 1, 5, 6, 8 ],
            [ 9, 1, 5, 7, 6, 8, 3, 4, 2 ],
            [ 6, 8, 3, 4, 2, 5, 1, 9, 7 ],
            [ 2, 5, 6, 1, 8, 9, 4, 7, 3 ],
            [ 3, 4, 9, 6, 7, 2, 8, 5, 1 ],
            [ 8, 7, 1, 5, 3, 4, 9, 2, 6 ]
        ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-08-30)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_08_30);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 7, 6, 2, 8, 5, 1, 9, 4, 3 ],
            [ 3, 5, 4, 9, 2, 6, 1, 7, 8 ],
            [ 8, 1, 9, 4, 7, 3, 6, 5, 2 ],
            [ 9, 3, 1, 5, 6, 8, 7, 2, 4 ],
            [ 2, 4, 5, 1, 9, 7, 3, 8, 6 ],
            [ 6, 7, 8, 3, 4, 2, 5, 1, 9 ],
            [ 4, 9, 7, 6, 8, 5, 2, 3, 1 ],
            [ 1, 2, 6, 7, 3, 4, 8, 9, 5 ],
            [ 5, 8, 3, 2, 1, 9, 4, 6, 7 ]
        ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-10-18)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_10_18);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 2, 6, 9, 3, 7, 8, 4, 1, 5 ],
            [ 5, 8, 1, 4, 2, 9, 7, 6, 3 ],
            [ 4, 7, 3, 5, 6, 1, 9, 2, 8 ],
            [ 1, 3, 5, 9, 8, 4, 6, 7, 2 ],
            [ 7, 2, 8, 6, 1, 3, 5, 4, 9 ],
            [ 9, 4, 6, 2, 5, 7, 8, 3, 1 ],
            [ 6, 9, 4, 8, 3, 2, 1, 5, 7 ],
            [ 8, 1, 2, 7, 4, 5, 3, 9, 6 ],
            [ 3, 5, 7, 1, 9, 6, 2, 8, 4 ]
        ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-10-19)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_10_19);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 9, 4, 8, 6, 7, 2, 5, 3, 1 ],
            [ 6, 3, 1, 5, 4, 9, 8, 2, 7 ],
            [ 2, 7, 5, 8, 3, 1, 6, 4, 9 ],
            [ 8, 2, 3, 1, 5, 7, 4, 9, 6 ],
            [ 7, 5, 4, 3, 9, 6, 2, 1, 8 ],
            [ 1, 6, 9, 2, 8, 4, 7, 5, 3 ],
            [ 3, 8, 7, 4, 1, 5, 9, 6, 2 ],
            [ 4, 9, 2, 7, 6, 3, 1, 8, 5 ],
            [ 5, 1, 6, 9, 2, 8, 3, 7, 4 ]
        ]);
    });

    test('Find solution (Killer Sudoku by Sudoku.com - Daily Challenge 2022-10-22)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_10_22);
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
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_10_25);
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
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);
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
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_10);
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

    test('Find solution (Killer Sudoku by Sudoku.com - Random Expert Level Challenge)', () => {
        const solver = new Solver(sudokuDotCom_randomExpertLevelChallenge);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 6, 8, 5, 1, 3, 2, 4, 7, 9 ],
            [ 7, 3, 4, 5, 9, 8, 1, 6, 2 ],
            [ 2, 1, 9, 7, 6, 4, 5, 3, 8 ],
            [ 9, 2, 6, 8, 7, 1, 3, 4, 5 ],
            [ 8, 5, 1, 3, 4, 9, 7, 2, 6 ],
            [ 4, 7, 3, 2, 5, 6, 8, 9, 1 ],
            [ 5, 6, 8, 4, 2, 7, 9, 1, 3 ],
            [ 3, 4, 2, 9, 1, 5, 6, 8, 7 ],
            [ 1, 9, 7, 6, 8, 3, 2, 5, 4 ]
        ]);
    });

    test('Find solution (whitebox verification)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);
        solver.solve();

        expect(solver.cellSolverAt(2, 7).placedNumber).toBe(8);
        expect(solver.cellSolverAt(2, 7).solved).toBe(true);

        _.range(UNIQUE_SEGMENT_LENGTH).forEach(idx => {
            expect(solver.rows[idx].cages.length).toBe(UNIQUE_SEGMENT_LENGTH);
            expect(solver.columns[idx].cages.length).toBe(UNIQUE_SEGMENT_LENGTH);
            expect(solver.subgrids[idx].cages.length).toBe(UNIQUE_SEGMENT_LENGTH);
        });
    });
});
