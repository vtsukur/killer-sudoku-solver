import _ from 'lodash';
import { sudokuDotCom_dailyChallengeOf_2022_11_01 } from '../problem/realProblemSamples';
import { House } from '../../src/problem/house';
import { Cell } from '../../src/problem/cell';
import { Cage } from '../../src/problem/cage';
import { Solver } from '../../src/solver/solver';
import { RowSolver } from '../../src/solver/rowSolver';
import { ColumnSolver } from '../../src/solver/columnSolver';
import { NonetSolver } from '../../src/solver/nonetSolver';

describe('Tests for creation and initialization of row, column and nonet solvers', () => {    
    test('Initialize row solvers', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);
        expect(solver.rowSolver(0)).toEqual(new RowSolver(
            0, _.range(9).map(col => Cell.at(0, col)), [
                Cage.ofSum(15).at(0, 0).at(0, 1).mk(),
                Cage.ofSum(7).at(0, 6).at(0, 7).mk()
            ]
        ));
        expect(solver.rowSolver(1)).toEqual(new RowSolver(
            1, _.range(9).map(col => Cell.at(1, col)), [
                Cage.ofSum(7).at(1, 0).at(1, 1).mk(),
                Cage.ofSum(10).at(1, 5).at(1, 6).at(1, 7).mk()
            ]
        ));
        expect(solver.rowSolver(2)).toEqual(new RowSolver(
            2, _.range(9).map(col => Cell.at(2, col)), [
                Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).mk(),
                Cage.ofSum(11).at(2, 3).at(2, 4).mk(),
                Cage.ofSum(9).at(2, 7).at(2, 8).mk()
            ]
        ));
        expect(solver.rowSolver(3)).toEqual(new RowSolver(
            3, _.range(9).map(col => Cell.at(3, col)), [
                Cage.ofSum(4).at(3, 0).at(3, 1).mk(),
                Cage.ofSum(2).at(3, 2).mk(),
                Cage.ofSum(14).at(3, 3).at(3, 4).mk()
            ]
        ));
        expect(solver.rowSolver(4)).toEqual(new RowSolver(
            4, _.range(9).map(col => Cell.at(4, col)), [
                Cage.ofSum(10).at(4, 3).at(4, 4).mk()
            ]
        ));
        expect(solver.rowSolver(5)).toEqual(new RowSolver(
            5, _.range(9).map(col => Cell.at(5, col)), []
        ));
        expect(solver.rowSolver(6)).toEqual(new RowSolver(
            6, _.range(9).map(col => Cell.at(6, col)), [
                Cage.ofSum(6).at(6, 4).at(6, 5).mk()
            ]
        ));
        expect(solver.rowSolver(7)).toEqual(new RowSolver(
            7, _.range(9).map(col => Cell.at(7, col)), [
                Cage.ofSum(8).at(7, 5).mk(),
                Cage.ofSum(10).at(7, 6).at(7, 7).mk()
            ]
        ));
        expect(solver.rowSolver(8)).toEqual(new RowSolver(
            8, _.range(9).map(col => Cell.at(8, col)), [
                Cage.ofSum(7).at(8, 6).at(8, 7).mk()
            ]
        ));
    });

    test('Determine residual cages in row solvers (shallow)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        const row0 = solver.rowSolver(0);
        const residualCage0 = row0.determineResidualCage();
        expect(residualCage0).toEqual(
            Cage.ofSum(23).at(0, 2).at(0, 3).at(0, 4).at(0, 5).at(0, 8).mk());
        
        const row5 = solver.rowSolver(5);
        const residualCage5 = row5.determineResidualCage();
        expect(residualCage5).toEqual(
            new Cage(House.SUM, _.range(House.SIZE).map(col => Cell.at(5, col))));
    });

    test('Initialize column solvers', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);
        expect(solver.columnSolver(0)).toEqual(new ColumnSolver(
            0, _.range(9).map(row => Cell.at(row, 0)), [
                Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).mk()
            ]
        ));
        expect(solver.columnSolver(1)).toEqual(new ColumnSolver(
            1, _.range(9).map(row => Cell.at(row, 1)), []
        ));
        expect(solver.columnSolver(2)).toEqual(new ColumnSolver(
            2, _.range(9).map(row => Cell.at(row, 2)), [
                Cage.ofSum(10).at(0, 2).at(1, 2).mk(),
                Cage.ofSum(2).at(3, 2).mk()
            ]
        ));
        expect(solver.columnSolver(3)).toEqual(new ColumnSolver(
            3, _.range(9).map(row => Cell.at(row, 3)), [
                Cage.ofSum(17).at(0, 3).at(1, 3).mk(),
                Cage.ofSum(6).at(7, 3).at(8, 3).mk()
            ]
        ));
        expect(solver.columnSolver(4)).toEqual(new ColumnSolver(
            4, _.range(9).map(row => Cell.at(row, 4)), []
        ));
        expect(solver.columnSolver(5)).toEqual(new ColumnSolver(
            5, _.range(9).map(row => Cell.at(row, 5)), [
                Cage.ofSum(8).at(2, 5).at(3, 5).mk(),
                Cage.ofSum(8).at(7, 5).mk()
            ]
        ));
        expect(solver.columnSolver(6)).toEqual(new ColumnSolver(
            6, _.range(9).map(row => Cell.at(row, 6)), [
                Cage.ofSum(16).at(2, 6).at(3, 6).mk()
            ]
        ));
        expect(solver.columnSolver(7)).toEqual(new ColumnSolver(
            7, _.range(9).map(row => Cell.at(row, 7)), [
                Cage.ofSum(5).at(3, 7).at(4, 7).mk()
            ]
        ));
        expect(solver.columnSolver(8)).toEqual(new ColumnSolver(
            8, _.range(9).map(row => Cell.at(row, 8)), [
                Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
                Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).mk(),
                Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).mk()
            ]
        ));
    });

    test('Determine residual cages in column solvers (shallow)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        const column0 = solver.columnSolver(0);
        const residualCage0 = column0.determineResidualCage();
        expect(residualCage0).toEqual(
            Cage.ofSum(26).at(0, 0).at(1, 0).at(2, 0).at(3, 0).at(4, 0).at(5, 0).mk()
        );
        
        const column1 = solver.columnSolver(1);
        const residualCage1 = column1.determineResidualCage();
        expect(residualCage1).toEqual(
            new Cage(House.SUM, _.range(House.SIZE).map(row => Cell.at(row, 1))));
    });

    test('Initialize nonets', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        expect(solver.nonetSolver(0)).toEqual(new NonetSolver(
            0, [
                Cell.at(0, 0), Cell.at(0, 1), Cell.at(0, 2),
                Cell.at(1, 0), Cell.at(1, 1), Cell.at(1, 2),
                Cell.at(2, 0), Cell.at(2, 1), Cell.at(2, 2)
            ], [
                Cage.ofSum(15).at(0, 0).at(0, 1).mk(),
                Cage.ofSum(10).at(0, 2).at(1, 2).mk(),
                Cage.ofSum(7).at(1, 0).at(1, 1).mk(),
                Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).mk()
            ]
        ));
        expect(solver.nonetSolver(1)).toEqual(new NonetSolver(
            1, [
                Cell.at(0, 3), Cell.at(0, 4), Cell.at(0, 5),
                Cell.at(1, 3), Cell.at(1, 4), Cell.at(1, 5),
                Cell.at(2, 3), Cell.at(2, 4), Cell.at(2, 5)
            ], [
                Cage.ofSum(17).at(0, 3).at(1, 3).mk(),
                Cage.ofSum(13).at(0, 4).at(0, 5).at(1, 4).mk(),
                Cage.ofSum(11).at(2, 3).at(2, 4).mk()
            ]
        ));
        expect(solver.nonetSolver(2)).toEqual(new NonetSolver(
            2, [
                Cell.at(0, 6), Cell.at(0, 7), Cell.at(0, 8),
                Cell.at(1, 6), Cell.at(1, 7), Cell.at(1, 8),
                Cell.at(2, 6), Cell.at(2, 7), Cell.at(2, 8)
            ], [
                Cage.ofSum(7).at(0, 6).at(0, 7).mk(),
                Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
                Cage.ofSum(9).at(2, 7).at(2, 8).mk()
            ]
        ));
        expect(solver.nonetSolver(3)).toEqual(new NonetSolver(
            3, [
                Cell.at(3, 0), Cell.at(3, 1), Cell.at(3, 2),
                Cell.at(4, 0), Cell.at(4, 1), Cell.at(4, 2),
                Cell.at(5, 0), Cell.at(5, 1), Cell.at(5, 2)
            ], [
                Cage.ofSum(4).at(3, 0).at(3, 1).mk(),
                Cage.ofSum(2).at(3, 2).mk(),
                Cage.ofSum(27).at(4, 0).at(4, 1).at(5, 0).at(5, 1).mk()
            ]
        ));
        expect(solver.nonetSolver(4)).toEqual(new NonetSolver(
            4, [
                Cell.at(3, 3), Cell.at(3, 4), Cell.at(3, 5),
                Cell.at(4, 3), Cell.at(4, 4), Cell.at(4, 5),
                Cell.at(5, 3), Cell.at(5, 4), Cell.at(5, 5)
            ], [
                Cage.ofSum(14).at(3, 3).at(3, 4).mk(),
                Cage.ofSum(10).at(4, 3).at(4, 4).mk()
            ]
        ));
        expect(solver.nonetSolver(5)).toEqual(new NonetSolver(
            5, [
                Cell.at(3, 6), Cell.at(3, 7), Cell.at(3, 8),
                Cell.at(4, 6), Cell.at(4, 7), Cell.at(4, 8),
                Cell.at(5, 6), Cell.at(5, 7), Cell.at(5, 8)
            ], [
                Cage.ofSum(5).at(3, 7).at(4, 7).mk(),
                Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).mk()
            ]
        ));
        expect(solver.nonetSolver(6)).toEqual(new NonetSolver(
            6, [
                Cell.at(6, 0), Cell.at(6, 1), Cell.at(6, 2),
                Cell.at(7, 0), Cell.at(7, 1), Cell.at(7, 2),
                Cell.at(8, 0), Cell.at(8, 1), Cell.at(8, 2)
            ], [
                Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).mk(),
                Cage.ofSum(14).at(6, 1).at(7, 1).at(8, 1).at(8, 2).mk()
            ]
        ));
        expect(solver.nonetSolver(7)).toEqual(new NonetSolver(
            7, [
                Cell.at(6, 3), Cell.at(6, 4), Cell.at(6, 5),
                Cell.at(7, 3), Cell.at(7, 4), Cell.at(7, 5),
                Cell.at(8, 3), Cell.at(8, 4), Cell.at(8, 5)
            ], [
                Cage.ofSum(6).at(6, 4).at(6, 5).mk(),
                Cage.ofSum(6).at(7, 3).at(8, 3).mk(),
                Cage.ofSum(22).at(7, 4).at(8, 4).at(8, 5).mk(),
                Cage.ofSum(8).at(7, 5).mk()
            ]
        ));
        expect(solver.nonetSolver(8)).toEqual(new NonetSolver(
            8, [
                Cell.at(6, 6), Cell.at(6, 7), Cell.at(6, 8),
                Cell.at(7, 6), Cell.at(7, 7), Cell.at(7, 8),
                Cell.at(8, 6), Cell.at(8, 7), Cell.at(8, 8)
            ], [
                Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).mk(),
                Cage.ofSum(10).at(7, 6).at(7, 7).mk(),
                Cage.ofSum(7).at(8, 6).at(8, 7).mk()
            ]
        ));
    });

    test('Determine residual cages in nonet solvers (shallow)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        const nonet0 = solver.nonetSolver(0);
        const residualCage0 = nonet0.determineResidualCage();
        expect(residualCage0).toBe(undefined);
        
        const nonet1 = solver.nonetSolver(1);
        const residualCage1 = nonet1.determineResidualCage();
        expect(residualCage1).toEqual(Cage.ofSum(4).at(1, 5).at(2, 5).mk());
    });
});
