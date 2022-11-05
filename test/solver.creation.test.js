import _ from "lodash";
import testProblem from './testProblem';
import { Cell, Sum } from '../src/problem';
import { Row, Column, Subgrid, Solver } from '../src/solver';

describe('Tests for creation and initialization of rows, columns and subgrids', () => {    
    test('Initialize rows', () => {
        const solver = new Solver(testProblem);
        expect(solver.initRow(0)).toEqual(new Row(
            0, [
                new Sum(15, [ new Cell(0, 0), new Cell(0, 1) ]),
                new Sum(7, [ new Cell(0, 6), new Cell(0, 7) ]),
                // new Sum(23, [ new Cell(0, 2), new Cell(0, 3), new Cell(0, 4), new Cell(0, 5), new Cell(0, 8)])
            ]
        ));
        expect(solver.initRow(1)).toEqual(new Row(
            1, [
                new Sum(7, [ new Cell(1, 0), new Cell(1, 1) ]),
                new Sum(10, [ new Cell(1, 5), new Cell(1, 6), new Cell(1, 7) ]),
                // new Sum(28, [ new Cell(1, 2), new Cell(1, 3), new Cell(1, 4), new Cell(1, 8) ])
            ]
        ));
        expect(solver.initRow(2)).toEqual(new Row(
            2, [
                new Sum(13, [ new Cell(2, 0), new Cell(2, 1), new Cell(2, 2) ]),
                new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]),
                new Sum(9, [ new Cell(2, 7), new Cell(2, 8) ]),
                // new Sum(12, [ new Cell(2, 5), new Cell(2, 6) ])
            ]
        ));
        expect(solver.initRow(3)).toEqual(new Row(
            3, [
                new Sum(4, [ new Cell(3, 0), new Cell(3, 1) ]),
                new Sum(2, [ new Cell(3, 2) ]),
                new Sum(14, [ new Cell(3, 3), new Cell(3, 4) ]),
                // new Sum(25, [ new Cell(3, 5), new Cell(3, 6), new Cell(3, 7), new Cell(3, 8) ])
            ]
        ));
        expect(solver.initRow(4)).toEqual(new Row(
            4, [
                new Sum(10, [ new Cell(4, 3), new Cell(4, 4) ]),
                // new Sum(35, [ new Cell(4, 0), new Cell(4, 1), new Cell(4, 2), new Cell(4, 5),
                //     new Cell(4, 6), new Cell(4, 7), new Cell(4, 8) ])
            ]
        ));
        expect(solver.initRow(5)).toEqual(new Row(
            5, [
                // new Sum(45, _.range(UNIQUE_SEGMENT_LENGTH).map(colIdx => new Cell(5, colIdx)))
            ]
        ));
        expect(solver.initRow(6)).toEqual(new Row(
            6, [
                new Sum(6, [ new Cell(6, 4), new Cell(6, 5) ]),
                // new Sum(39, [ new Cell(6, 0), new Cell(6, 1), new Cell(6, 2), new Cell(6, 3),
                //     new Cell(6, 6), new Cell(6, 7), new Cell(6, 8) ])
            ]
        ));
        expect(solver.initRow(7)).toEqual(new Row(
            7, [
                new Sum(8, [ new Cell(7, 5) ]),
                new Sum(10, [ new Cell(7, 6), new Cell(7, 7) ]),
                // new Sum(27, [ new Cell(7, 0), new Cell(7, 1), new Cell(7, 2), new Cell(7, 3),
                //     new Cell(7, 4), new Cell(7, 8) ])
            ]
        ));
        expect(solver.initRow(8)).toEqual(new Row(
            8, [
                new Sum(7, [ new Cell(8, 6), new Cell(8, 7) ]),
                // new Sum(38, [ new Cell(8, 0), new Cell(8, 1), new Cell(8, 2), new Cell(8, 3),
                //     new Cell(8, 4), new Cell(8, 5), new Cell(8, 8) ])
            ]
        ));
    });

    test('Initialize columns', () => {
        const solver = new Solver(testProblem);
        expect(solver.initColumn(0)).toEqual(new Column(
            0, [
                new Sum(19, [ new Cell(6, 0), new Cell(7, 0), new Cell(8, 0) ]),
                // new Sum(26, [ new Cell(0, 0), new Cell(1, 0), new Cell(2, 0),
                //     new Cell(3, 0), new Cell(4, 0), new Cell(5, 0) ])
            ]
        ));
        expect(solver.initColumn(1)).toEqual(new Column(
            1, [
                // new Sum(45, _.range(UNIQUE_SEGMENT_LENGTH).map(rowIdx => new Cell(rowIdx, 1)))
            ]
        ));
        expect(solver.initColumn(2)).toEqual(new Column(
            2, [
                new Sum(10, [ new Cell(0, 2), new Cell(1, 2) ]),
                new Sum(2, [ new Cell(3, 2) ]),
                // new Sum(33, [ new Cell(2, 2), new Cell(4, 2), new Cell(5, 2),
                //     new Cell(6, 2), new Cell(7, 2), new Cell(8, 2) ])
            ]
        ));
        expect(solver.initColumn(3)).toEqual(new Column(
            3, [
                new Sum(17, [ new Cell(0, 3), new Cell(1, 3) ]),
                new Sum(6, [ new Cell(7, 3), new Cell(8, 3) ]),
                // new Sum(22, [ new Cell(2, 3), new Cell(3, 3), new Cell(4, 3),
                //     new Cell(5, 3), new Cell(6, 3) ])
            ]
        ));
        expect(solver.initColumn(4)).toEqual(new Column(
            4, [
                // new Sum(45, _.range(UNIQUE_SEGMENT_LENGTH).map(row => new Cell(row, 4)))
            ]
        ));
        expect(solver.initColumn(5)).toEqual(new Column(
            5, [
                new Sum(8, [ new Cell(2, 5), new Cell(3, 5) ]),
                new Sum(8, [ new Cell(7, 5) ]),
                // new Sum(29, [ new Cell(0, 5), new Cell(1, 5), new Cell(4, 5),
                //     new Cell(5, 5), new Cell(6, 5), new Cell(8, 5) ])
            ]
        ));
        expect(solver.initColumn(6)).toEqual(new Column(
            6, [
                new Sum(16, [ new Cell(2, 6), new Cell(3, 6) ]),
                // new Sum(29, [ new Cell(0, 6), new Cell(1, 6), new Cell(4, 6),
                //     new Cell(5, 6), new Cell(6, 6), new Cell(7, 6), new Cell(8, 6) ])
            ]
        ));
        expect(solver.initColumn(7)).toEqual(new Column(
            7, [
                new Sum(5, [ new Cell(3, 7), new Cell(4, 7) ]),
                // new Sum(40, [ new Cell(0, 7), new Cell(1, 7), new Cell(2, 7),
                //     new Cell(5, 7), new Cell(6, 7), new Cell(7, 7), new Cell(8, 7) ])
            ]
        ));
        expect(solver.initColumn(8)).toEqual(new Column(
            8, [
                new Sum(11, [ new Cell(0, 8), new Cell(1, 8) ]),
                new Sum(19, [ new Cell(3, 8), new Cell(4, 8), new Cell(5, 8) ]),
                new Sum(14, [ new Cell(6, 8), new Cell(7, 8), new Cell(8, 8) ]),
                // new Sum(1, [ new Cell(2, 8) ])
            ]
        ));
    });

    test('Initialize subgrids with leftover sums', () => {
        const solver = new Solver(testProblem);
        expect(solver.initSubgrid(0)).toEqual(new Subgrid(
            0, [
                new Sum(15, [ new Cell(0, 0), new Cell(0, 1) ]),
                new Sum(10, [ new Cell(0, 2), new Cell(1, 2) ]),
                new Sum(7, [ new Cell(1, 0), new Cell(1, 1) ]),
                new Sum(13, [ new Cell(2, 0), new Cell(2, 1), new Cell(2, 2) ])
            ]
        ));
        expect(solver.initSubgrid(1)).toEqual(new Subgrid(
            1, [
                new Sum(17, [ new Cell(0, 3), new Cell(1, 3) ]),
                new Sum(13, [ new Cell(0, 4), new Cell(0, 5), new Cell(1, 4) ]),
                new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]),
                // new Sum(4, [ new Cell(1, 5), new Cell(2, 5) ])
            ]
        ));
        expect(solver.initSubgrid(2)).toEqual(new Subgrid(
            2, [
                new Sum(7, [ new Cell(0, 6), new Cell(0, 7) ]),
                new Sum(11, [ new Cell(0, 8), new Cell(1, 8) ]),
                new Sum(9, [ new Cell(2, 7), new Cell(2, 8) ]),
                // new Sum(18, [ new Cell(1, 6), new Cell(1, 7), new Cell(2, 6) ])
            ]
        ));
        expect(solver.initSubgrid(3)).toEqual(new Subgrid(
            3, [
                new Sum(4, [ new Cell(3, 0), new Cell(3, 1) ]),
                new Sum(2, [ new Cell(3, 2) ]),
                new Sum(27, [ new Cell(4, 0), new Cell(4, 1), new Cell(5, 0), new Cell(5, 1) ]),
                // new Sum(12, [ new Cell(4, 2), new Cell(5, 2) ])
            ]
        ));
        expect(solver.initSubgrid(4)).toEqual(new Subgrid(
            4, [
                new Sum(14, [ new Cell(3, 3), new Cell(3, 4) ]),
                new Sum(10, [ new Cell(4, 3), new Cell(4, 4) ]),
                // new Sum(21, [ new Cell(3, 5), new Cell(4, 5),
                //     new Cell(5, 3), new Cell(5, 4), new Cell(5, 5) ])
            ]
        ));
        expect(solver.initSubgrid(5)).toEqual(new Subgrid(
            5, [
                new Sum(5, [ new Cell(3, 7), new Cell(4, 7) ]),
                new Sum(19, [ new Cell(3, 8), new Cell(4, 8), new Cell(5, 8) ]),
                // new Sum(21, [ new Cell(3, 6), new Cell(4, 6),
                //     new Cell(5, 6), new Cell(5, 7) ])
            ]
        ));
        expect(solver.initSubgrid(6)).toEqual(new Subgrid(
            6, [
                new Sum(19, [ new Cell(6, 0), new Cell(7, 0), new Cell(8, 0) ]),
                new Sum(14, [ new Cell(6, 1), new Cell(7, 1), new Cell(8, 1), new Cell(8, 2) ]),
                // new Sum(12, [ new Cell(6, 2), new Cell(7, 2) ])
            ]
        ));
        expect(solver.initSubgrid(7)).toEqual(new Subgrid(
            7, [
                new Sum(6, [ new Cell(6, 4), new Cell(6, 5) ]),
                new Sum(6, [ new Cell(7, 3), new Cell(8, 3) ]),
                new Sum(22, [ new Cell(7, 4), new Cell(8, 4), new Cell(8, 5) ]),
                new Sum(8, [ new Cell(7, 5) ]),
                // new Sum(3, [ new Cell(6, 3) ])
            ]
        ));
        expect(solver.initSubgrid(8)).toEqual(new Subgrid(
            8, [
                new Sum(14, [ new Cell(6, 8), new Cell(7, 8), new Cell(8, 8) ]),
                new Sum(10, [ new Cell(7, 6), new Cell(7, 7) ]),
                new Sum(7, [ new Cell(8, 6), new Cell(8, 7) ]),
                // new Sum(14, [ new Cell(6, 6), new Cell(6, 7) ])
            ]
        ));
    });
});
