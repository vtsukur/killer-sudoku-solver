import _ from 'lodash';
import testProblem from './testProblem';
import { Cell, Sum } from '../src/problem';
import { Row, Column, Subgrid, Solver } from '../src/solver';

describe('Tests for creation and initialization of rows, columns and subgrids', () => {    
    test('Initialize rows', () => {
        const solver = new Solver(testProblem);
        expect(solver.initRow(0)).toEqual(new Row(
            0, [
                Sum.of(15).cell(0, 0).cell(0, 1).mk(),
                Sum.of(7).cell(0, 6).cell(0, 7).mk(),
                // Sum.of(23).cell(0, 2).cell(0, 3).cell(0, 4).cell(0, 5).cell(0, 8)])
            ], _.range(9).map(colIdx => new Cell(0, colIdx))
        ));
        // expect(solver.initRow(1)).toEqual(new Row(
        //     1, [
        //         Sum.of(7).cell(1, 0).cell(1, 1).mk(),
        //         Sum.of(10).cell(1, 5).cell(1, 6).cell(1, 7).mk(),
        //         // Sum.of(28).cell(1, 2).cell(1, 3).cell(1, 4).cell(1, 8).mk()
        //     ]
        // ));
        // expect(solver.initRow(2)).toEqual(new Row(
        //     2, [
        //         Sum.of(13).cell(2, 0).cell(2, 1).cell(2, 2).mk(),
        //         Sum.of(11).cell(2, 3).cell(2, 4).mk(),
        //         Sum.of(9).cell(2, 7).cell(2, 8).mk(),
        //         // Sum.of(12).cell(2, 5).cell(2, 6).mk()
        //     ]
        // ));
        // expect(solver.initRow(3)).toEqual(new Row(
        //     3, [
        //         Sum.of(4).cell(3, 0).cell(3, 1).mk(),
        //         Sum.of(2).cell(3, 2).mk(),
        //         Sum.of(14).cell(3, 3).cell(3, 4).mk(),
        //         // Sum.of(25).cell(3, 5).cell(3, 6).cell(3, 7).cell(3, 8).mk()
        //     ]
        // ));
        // expect(solver.initRow(4)).toEqual(new Row(
        //     4, [
        //         Sum.of(10).cell(4, 3).cell(4, 4).mk(),
        //         // Sum.of(35).cell(4, 0).cell(4, 1).cell(4, 2).cell(4, 5),
        //         //     in(4, 6).cell(4, 7).cell(4, 8).mk()
        //     ]
        // ));
        // expect(solver.initRow(5)).toEqual(new Row(
        //     5, [
        //         // Sum.of(45, _.range(UNIQUE_SEGMENT_LENGTH).map(colIdx => in(5, colIdx)))
        //     ]
        // ));
        // expect(solver.initRow(6)).toEqual(new Row(
        //     6, [
        //         Sum.of(6).cell(6, 4).cell(6, 5).mk(),
        //         // Sum.of(39).cell(6, 0).cell(6, 1).cell(6, 2).cell(6, 3),
        //         //     in(6, 6).cell(6, 7).cell(6, 8).mk()
        //     ]
        // ));
        // expect(solver.initRow(7)).toEqual(new Row(
        //     7, [
        //         Sum.of(8).cell(7, 5).mk(),
        //         Sum.of(10).cell(7, 6).cell(7, 7).mk(),
        //         // Sum.of(27).cell(7, 0).cell(7, 1).cell(7, 2).cell(7, 3),
        //         //     in(7, 4).cell(7, 8).mk()
        //     ]
        // ));
        // expect(solver.initRow(8)).toEqual(new Row(
        //     8, [
        //         Sum.of(7).cell(8, 6).cell(8, 7).mk(),
        //         // Sum.of(38).cell(8, 0).cell(8, 1).cell(8, 2).cell(8, 3),
        //         //     in(8, 4).cell(8, 5).cell(8, 8).mk()
        //     ]
        // ));
    });

    test('Initialize columns', () => {
        const solver = new Solver(testProblem);
        expect(solver.initColumn(0)).toEqual(new Column(
            0, [
                Sum.of(19).cell(6, 0).cell(7, 0).cell(8, 0).mk(),
                // Sum.of(26).cell(0, 0).cell(1, 0).cell(2, 0),
                //     in(3, 0).cell(4, 0).cell(5, 0).mk()
            ]
        ));
        expect(solver.initColumn(1)).toEqual(new Column(
            1, [
                // Sum.of(45, _.range(UNIQUE_SEGMENT_LENGTH).map(rowIdx => in(rowIdx, 1)))
            ]
        ));
        expect(solver.initColumn(2)).toEqual(new Column(
            2, [
                Sum.of(10).cell(0, 2).cell(1, 2).mk(),
                Sum.of(2).cell(3, 2).mk(),
                // Sum.of(33).cell(2, 2).cell(4, 2).cell(5, 2),
                //     in(6, 2).cell(7, 2).cell(8, 2).mk()
            ]
        ));
        expect(solver.initColumn(3)).toEqual(new Column(
            3, [
                Sum.of(17).cell(0, 3).cell(1, 3).mk(),
                Sum.of(6).cell(7, 3).cell(8, 3).mk(),
                // Sum.of(22).cell(2, 3).cell(3, 3).cell(4, 3),
                //     in(5, 3).cell(6, 3).mk()
            ]
        ));
        expect(solver.initColumn(4)).toEqual(new Column(
            4, [
                // Sum.of(45, _.range(UNIQUE_SEGMENT_LENGTH).map(row => in(row, 4)))
            ]
        ));
        expect(solver.initColumn(5)).toEqual(new Column(
            5, [
                Sum.of(8).cell(2, 5).cell(3, 5).mk(),
                Sum.of(8).cell(7, 5).mk(),
                // Sum.of(29).cell(0, 5).cell(1, 5).cell(4, 5),
                //     in(5, 5).cell(6, 5).cell(8, 5).mk()
            ]
        ));
        expect(solver.initColumn(6)).toEqual(new Column(
            6, [
                Sum.of(16).cell(2, 6).cell(3, 6).mk(),
                // Sum.of(29).cell(0, 6).cell(1, 6).cell(4, 6),
                //     in(5, 6).cell(6, 6).cell(7, 6).cell(8, 6).mk()
            ]
        ));
        expect(solver.initColumn(7)).toEqual(new Column(
            7, [
                Sum.of(5).cell(3, 7).cell(4, 7).mk(),
                // Sum.of(40).cell(0, 7).cell(1, 7).cell(2, 7),
                //     in(5, 7).cell(6, 7).cell(7, 7).cell(8, 7).mk()
            ]
        ));
        expect(solver.initColumn(8)).toEqual(new Column(
            8, [
                Sum.of(11).cell(0, 8).cell(1, 8).mk(),
                Sum.of(19).cell(3, 8).cell(4, 8).cell(5, 8).mk(),
                Sum.of(14).cell(6, 8).cell(7, 8).cell(8, 8).mk(),
                // Sum.of(1).cell(2, 8).mk()
            ]
        ));
    });

    test('Initialize subgrids with leftover sums', () => {
        const solver = new Solver(testProblem);
        expect(solver.initSubgrid(0)).toEqual(new Subgrid(
            0, [
                Sum.of(15).cell(0, 0).cell(0, 1).mk(),
                Sum.of(10).cell(0, 2).cell(1, 2).mk(),
                Sum.of(7).cell(1, 0).cell(1, 1).mk(),
                Sum.of(13).cell(2, 0).cell(2, 1).cell(2, 2).mk()
            ]
        ));
        expect(solver.initSubgrid(1)).toEqual(new Subgrid(
            1, [
                Sum.of(17).cell(0, 3).cell(1, 3).mk(),
                Sum.of(13).cell(0, 4).cell(0, 5).cell(1, 4).mk(),
                Sum.of(11).cell(2, 3).cell(2, 4).mk(),
                // Sum.of(4).cell(1, 5).cell(2, 5).mk()
            ]
        ));
        expect(solver.initSubgrid(2)).toEqual(new Subgrid(
            2, [
                Sum.of(7).cell(0, 6).cell(0, 7).mk(),
                Sum.of(11).cell(0, 8).cell(1, 8).mk(),
                Sum.of(9).cell(2, 7).cell(2, 8).mk(),
                // Sum.of(18).cell(1, 6).cell(1, 7).cell(2, 6).mk()
            ]
        ));
        expect(solver.initSubgrid(3)).toEqual(new Subgrid(
            3, [
                Sum.of(4).cell(3, 0).cell(3, 1).mk(),
                Sum.of(2).cell(3, 2).mk(),
                Sum.of(27).cell(4, 0).cell(4, 1).cell(5, 0).cell(5, 1).mk(),
                // Sum.of(12).cell(4, 2).cell(5, 2).mk()
            ]
        ));
        expect(solver.initSubgrid(4)).toEqual(new Subgrid(
            4, [
                Sum.of(14).cell(3, 3).cell(3, 4).mk(),
                Sum.of(10).cell(4, 3).cell(4, 4).mk(),
                // Sum.of(21).cell(3, 5).cell(4, 5),
                //     in(5, 3).cell(5, 4).cell(5, 5).mk()
            ]
        ));
        expect(solver.initSubgrid(5)).toEqual(new Subgrid(
            5, [
                Sum.of(5).cell(3, 7).cell(4, 7).mk(),
                Sum.of(19).cell(3, 8).cell(4, 8).cell(5, 8).mk(),
                // Sum.of(21).cell(3, 6).cell(4, 6),
                //     in(5, 6).cell(5, 7).mk()
            ]
        ));
        expect(solver.initSubgrid(6)).toEqual(new Subgrid(
            6, [
                Sum.of(19).cell(6, 0).cell(7, 0).cell(8, 0).mk(),
                Sum.of(14).cell(6, 1).cell(7, 1).cell(8, 1).cell(8, 2).mk(),
                // Sum.of(12).cell(6, 2).cell(7, 2).mk()
            ]
        ));
        expect(solver.initSubgrid(7)).toEqual(new Subgrid(
            7, [
                Sum.of(6).cell(6, 4).cell(6, 5).mk(),
                Sum.of(6).cell(7, 3).cell(8, 3).mk(),
                Sum.of(22).cell(7, 4).cell(8, 4).cell(8, 5).mk(),
                Sum.of(8).cell(7, 5).mk(),
                // Sum.of(3).cell(6, 3).mk()
            ]
        ));
        expect(solver.initSubgrid(8)).toEqual(new Subgrid(
            8, [
                Sum.of(14).cell(6, 8).cell(7, 8).cell(8, 8).mk(),
                Sum.of(10).cell(7, 6).cell(7, 7).mk(),
                Sum.of(7).cell(8, 6).cell(8, 7).mk(),
                // Sum.of(14).cell(6, 6).cell(6, 7).mk()
            ]
        ));
    });
});
