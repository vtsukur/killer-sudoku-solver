import _ from 'lodash';
import { sudokuDotCom_dailyChallengeOf_2022_11_01 } from '../realProblemSamples';
import { UNIQUE_SEGMENT_LENGTH, UNIQUE_SEGMENT_SUM } from '../../src/problem/constants';
import { Cell } from '../../src/problem/cell';
import { Cage } from '../../src/problem/cage';
import { Row, Column, Subgrid, Solver } from '../../src/solver/solver';

describe('Tests for creation and initialization of rows, columns and subgrids', () => {    
    test('Initialize rows', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);
        expect(solver.row(0)).toEqual(new Row(
            0, _.range(9).map(colIdx => new Cell(0, colIdx)), [
                Cage.of(15).cell(0, 0).cell(0, 1).mk(),
                Cage.of(7).cell(0, 6).cell(0, 7).mk()
            ]
        ));
        expect(solver.row(1)).toEqual(new Row(
            1, _.range(9).map(colIdx => new Cell(1, colIdx)), [
                Cage.of(7).cell(1, 0).cell(1, 1).mk(),
                Cage.of(10).cell(1, 5).cell(1, 6).cell(1, 7).mk()
            ]
        ));
        expect(solver.row(2)).toEqual(new Row(
            2, _.range(9).map(colIdx => new Cell(2, colIdx)), [
                Cage.of(13).cell(2, 0).cell(2, 1).cell(2, 2).mk(),
                Cage.of(11).cell(2, 3).cell(2, 4).mk(),
                Cage.of(9).cell(2, 7).cell(2, 8).mk()
            ]
        ));
        expect(solver.row(3)).toEqual(new Row(
            3, _.range(9).map(colIdx => new Cell(3, colIdx)), [
                Cage.of(4).cell(3, 0).cell(3, 1).mk(),
                Cage.of(2).cell(3, 2).mk(),
                Cage.of(14).cell(3, 3).cell(3, 4).mk()
            ]
        ));
        expect(solver.row(4)).toEqual(new Row(
            4, _.range(9).map(colIdx => new Cell(4, colIdx)), [
                Cage.of(10).cell(4, 3).cell(4, 4).mk()
            ]
        ));
        expect(solver.row(5)).toEqual(new Row(
            5, _.range(9).map(colIdx => new Cell(5, colIdx)), []
        ));
        expect(solver.row(6)).toEqual(new Row(
            6, _.range(9).map(colIdx => new Cell(6, colIdx)), [
                Cage.of(6).cell(6, 4).cell(6, 5).mk()
            ]
        ));
        expect(solver.row(7)).toEqual(new Row(
            7, _.range(9).map(colIdx => new Cell(7, colIdx)), [
                Cage.of(8).cell(7, 5).mk(),
                Cage.of(10).cell(7, 6).cell(7, 7).mk()
            ]
        ));
        expect(solver.row(8)).toEqual(new Row(
            8, _.range(9).map(colIdx => new Cell(8, colIdx)), [
                Cage.of(7).cell(8, 6).cell(8, 7).mk()
            ]
        ));
    });

    test('Determine residual cages in rows (shallow)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        const row0 = solver.row(0);
        const residualSum0 = row0.determineResidualSum();
        expect(residualSum0).toEqual(
            Cage.of(23).cell(0, 2).cell(0, 3).cell(0, 4).cell(0, 5).cell(0, 8).mk());
        
        const row5 = solver.row(5);
        const residualSum5 = row5.determineResidualSum();
        expect(residualSum5).toEqual(
            new Cage(UNIQUE_SEGMENT_SUM, _.range(UNIQUE_SEGMENT_LENGTH).map(colIdx => new Cell(5, colIdx))));
    });

    test('Initialize columns', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);
        expect(solver.column(0)).toEqual(new Column(
            0, _.range(9).map(rowIdx => new Cell(rowIdx, 0)), [
                Cage.of(19).cell(6, 0).cell(7, 0).cell(8, 0).mk()
            ]
        ));
        expect(solver.column(1)).toEqual(new Column(
            1, _.range(9).map(rowIdx => new Cell(rowIdx, 1)), []
        ));
        expect(solver.column(2)).toEqual(new Column(
            2, _.range(9).map(rowIdx => new Cell(rowIdx, 2)), [
                Cage.of(10).cell(0, 2).cell(1, 2).mk(),
                Cage.of(2).cell(3, 2).mk()
            ]
        ));
        expect(solver.column(3)).toEqual(new Column(
            3, _.range(9).map(rowIdx => new Cell(rowIdx, 3)), [
                Cage.of(17).cell(0, 3).cell(1, 3).mk(),
                Cage.of(6).cell(7, 3).cell(8, 3).mk()
            ]
        ));
        expect(solver.column(4)).toEqual(new Column(
            4, _.range(9).map(rowIdx => new Cell(rowIdx, 4)), []
        ));
        expect(solver.column(5)).toEqual(new Column(
            5, _.range(9).map(rowIdx => new Cell(rowIdx, 5)), [
                Cage.of(8).cell(2, 5).cell(3, 5).mk(),
                Cage.of(8).cell(7, 5).mk()
            ]
        ));
        expect(solver.column(6)).toEqual(new Column(
            6, _.range(9).map(rowIdx => new Cell(rowIdx, 6)), [
                Cage.of(16).cell(2, 6).cell(3, 6).mk()
            ]
        ));
        expect(solver.column(7)).toEqual(new Column(
            7, _.range(9).map(rowIdx => new Cell(rowIdx, 7)), [
                Cage.of(5).cell(3, 7).cell(4, 7).mk()
            ]
        ));
        expect(solver.column(8)).toEqual(new Column(
            8, _.range(9).map(rowIdx => new Cell(rowIdx, 8)), [
                Cage.of(11).cell(0, 8).cell(1, 8).mk(),
                Cage.of(19).cell(3, 8).cell(4, 8).cell(5, 8).mk(),
                Cage.of(14).cell(6, 8).cell(7, 8).cell(8, 8).mk()
            ]
        ));
    });

    test('Determine residual cages in columns (shallow)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        const column0 = solver.column(0);
        const residualSum0 = column0.determineResidualSum();
        expect(residualSum0).toEqual(
            Cage.of(26).cell(0, 0).cell(1, 0).cell(2, 0).cell(3, 0).cell(4, 0).cell(5, 0).mk()
        );
        
        const column1 = solver.column(1);
        const residualSum1 = column1.determineResidualSum();
        expect(residualSum1).toEqual(
            new Cage(UNIQUE_SEGMENT_SUM, _.range(UNIQUE_SEGMENT_LENGTH).map(rowIdx => new Cell(rowIdx, 1))));
    });

    test('Initialize subgrids', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        expect(solver.subgrids[0]).toEqual(new Subgrid(
            0, [
                new Cell(0, 0), new Cell(0, 1), new Cell(0, 2),
                new Cell(1, 0), new Cell(1, 1), new Cell(1, 2),
                new Cell(2, 0), new Cell(2, 1), new Cell(2, 2)
            ], [
                Cage.of(15).cell(0, 0).cell(0, 1).mk(),
                Cage.of(10).cell(0, 2).cell(1, 2).mk(),
                Cage.of(7).cell(1, 0).cell(1, 1).mk(),
                Cage.of(13).cell(2, 0).cell(2, 1).cell(2, 2).mk()
            ]
        ));
        expect(solver.subgrid(1)).toEqual(new Subgrid(
            1, [
                new Cell(0, 3), new Cell(0, 4), new Cell(0, 5),
                new Cell(1, 3), new Cell(1, 4), new Cell(1, 5),
                new Cell(2, 3), new Cell(2, 4), new Cell(2, 5)
            ], [
                Cage.of(17).cell(0, 3).cell(1, 3).mk(),
                Cage.of(13).cell(0, 4).cell(0, 5).cell(1, 4).mk(),
                Cage.of(11).cell(2, 3).cell(2, 4).mk()
            ]
        ));
        expect(solver.subgrid(2)).toEqual(new Subgrid(
            2, [
                new Cell(0, 6), new Cell(0, 7), new Cell(0, 8),
                new Cell(1, 6), new Cell(1, 7), new Cell(1, 8),
                new Cell(2, 6), new Cell(2, 7), new Cell(2, 8)
            ], [
                Cage.of(7).cell(0, 6).cell(0, 7).mk(),
                Cage.of(11).cell(0, 8).cell(1, 8).mk(),
                Cage.of(9).cell(2, 7).cell(2, 8).mk()
            ]
        ));
        expect(solver.subgrid(3)).toEqual(new Subgrid(
            3, [
                new Cell(3, 0), new Cell(3, 1), new Cell(3, 2),
                new Cell(4, 0), new Cell(4, 1), new Cell(4, 2),
                new Cell(5, 0), new Cell(5, 1), new Cell(5, 2)
            ], [
                Cage.of(4).cell(3, 0).cell(3, 1).mk(),
                Cage.of(2).cell(3, 2).mk(),
                Cage.of(27).cell(4, 0).cell(4, 1).cell(5, 0).cell(5, 1).mk()
            ]
        ));
        expect(solver.subgrid(4)).toEqual(new Subgrid(
            4, [
                new Cell(3, 3), new Cell(3, 4), new Cell(3, 5),
                new Cell(4, 3), new Cell(4, 4), new Cell(4, 5),
                new Cell(5, 3), new Cell(5, 4), new Cell(5, 5)
            ], [
                Cage.of(14).cell(3, 3).cell(3, 4).mk(),
                Cage.of(10).cell(4, 3).cell(4, 4).mk()
            ]
        ));
        expect(solver.subgrid(5)).toEqual(new Subgrid(
            5, [
                new Cell(3, 6), new Cell(3, 7), new Cell(3, 8),
                new Cell(4, 6), new Cell(4, 7), new Cell(4, 8),
                new Cell(5, 6), new Cell(5, 7), new Cell(5, 8)
            ], [
                Cage.of(5).cell(3, 7).cell(4, 7).mk(),
                Cage.of(19).cell(3, 8).cell(4, 8).cell(5, 8).mk()
            ]
        ));
        expect(solver.subgrid(6)).toEqual(new Subgrid(
            6, [
                new Cell(6, 0), new Cell(6, 1), new Cell(6, 2),
                new Cell(7, 0), new Cell(7, 1), new Cell(7, 2),
                new Cell(8, 0), new Cell(8, 1), new Cell(8, 2)
            ], [
                Cage.of(19).cell(6, 0).cell(7, 0).cell(8, 0).mk(),
                Cage.of(14).cell(6, 1).cell(7, 1).cell(8, 1).cell(8, 2).mk()
            ]
        ));
        expect(solver.subgrid(7)).toEqual(new Subgrid(
            7, [
                new Cell(6, 3), new Cell(6, 4), new Cell(6, 5),
                new Cell(7, 3), new Cell(7, 4), new Cell(7, 5),
                new Cell(8, 3), new Cell(8, 4), new Cell(8, 5)
            ], [
                Cage.of(6).cell(6, 4).cell(6, 5).mk(),
                Cage.of(6).cell(7, 3).cell(8, 3).mk(),
                Cage.of(22).cell(7, 4).cell(8, 4).cell(8, 5).mk(),
                Cage.of(8).cell(7, 5).mk()
            ]
        ));
        expect(solver.subgrid(8)).toEqual(new Subgrid(
            8, [
                new Cell(6, 6), new Cell(6, 7), new Cell(6, 8),
                new Cell(7, 6), new Cell(7, 7), new Cell(7, 8),
                new Cell(8, 6), new Cell(8, 7), new Cell(8, 8)
            ], [
                Cage.of(14).cell(6, 8).cell(7, 8).cell(8, 8).mk(),
                Cage.of(10).cell(7, 6).cell(7, 7).mk(),
                Cage.of(7).cell(8, 6).cell(8, 7).mk()
            ]
        ));
    });

    test('Determine residual cages in subgrids (shallow)', () => {
        const solver = new Solver(sudokuDotCom_dailyChallengeOf_2022_11_01);

        const subgrid0 = solver.subgrid(0);
        const residualSum0 = subgrid0.determineResidualSum();
        expect(residualSum0).toBe(undefined);
        
        const subgrid1 = solver.subgrid(1);
        const residualSum1 = subgrid1.determineResidualSum();
        expect(residualSum1).toEqual(Cage.of(4).cell(1, 5).cell(2, 5).mk());
    });
});
