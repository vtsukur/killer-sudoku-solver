import _ from "lodash";
import testProblem from './testProblem';
import { Sum } from '../src/problem';
import { Row, Column, Subgrid, Solver } from '../src/solver';

describe('Tests for creation and initialization of rows, columns and subgrids', () => {    
    test('Initialize rows', () => {
        const solver = new Solver(testProblem);
        expect(solver.initRow(0)).toEqual(new Row(
            0, [
                Sum.of(15).in(0, 0).in(0, 1).mk(),
                Sum.of(7).in(0, 6).in(0, 7).mk(),
                // Sum.of(23).in(0, 2).in(0, 3).in(0, 4).in(0, 5).in(0, 8)])
            ]
        ));
        expect(solver.initRow(1)).toEqual(new Row(
            1, [
                Sum.of(7).in(1, 0).in(1, 1).mk(),
                Sum.of(10).in(1, 5).in(1, 6).in(1, 7).mk(),
                // Sum.of(28).in(1, 2).in(1, 3).in(1, 4).in(1, 8).mk()
            ]
        ));
        expect(solver.initRow(2)).toEqual(new Row(
            2, [
                Sum.of(13).in(2, 0).in(2, 1).in(2, 2).mk(),
                Sum.of(11).in(2, 3).in(2, 4).mk(),
                Sum.of(9).in(2, 7).in(2, 8).mk(),
                // Sum.of(12).in(2, 5).in(2, 6).mk()
            ]
        ));
        expect(solver.initRow(3)).toEqual(new Row(
            3, [
                Sum.of(4).in(3, 0).in(3, 1).mk(),
                Sum.of(2).in(3, 2).mk(),
                Sum.of(14).in(3, 3).in(3, 4).mk(),
                // Sum.of(25).in(3, 5).in(3, 6).in(3, 7).in(3, 8).mk()
            ]
        ));
        expect(solver.initRow(4)).toEqual(new Row(
            4, [
                Sum.of(10).in(4, 3).in(4, 4).mk(),
                // Sum.of(35).in(4, 0).in(4, 1).in(4, 2).in(4, 5),
                //     in(4, 6).in(4, 7).in(4, 8).mk()
            ]
        ));
        expect(solver.initRow(5)).toEqual(new Row(
            5, [
                // Sum.of(45, _.range(UNIQUE_SEGMENT_LENGTH).map(colIdx => in(5, colIdx)))
            ]
        ));
        expect(solver.initRow(6)).toEqual(new Row(
            6, [
                Sum.of(6).in(6, 4).in(6, 5).mk(),
                // Sum.of(39).in(6, 0).in(6, 1).in(6, 2).in(6, 3),
                //     in(6, 6).in(6, 7).in(6, 8).mk()
            ]
        ));
        expect(solver.initRow(7)).toEqual(new Row(
            7, [
                Sum.of(8).in(7, 5).mk(),
                Sum.of(10).in(7, 6).in(7, 7).mk(),
                // Sum.of(27).in(7, 0).in(7, 1).in(7, 2).in(7, 3),
                //     in(7, 4).in(7, 8).mk()
            ]
        ));
        expect(solver.initRow(8)).toEqual(new Row(
            8, [
                Sum.of(7).in(8, 6).in(8, 7).mk(),
                // Sum.of(38).in(8, 0).in(8, 1).in(8, 2).in(8, 3),
                //     in(8, 4).in(8, 5).in(8, 8).mk()
            ]
        ));
    });

    test('Initialize columns', () => {
        const solver = new Solver(testProblem);
        expect(solver.initColumn(0)).toEqual(new Column(
            0, [
                Sum.of(19).in(6, 0).in(7, 0).in(8, 0).mk(),
                // Sum.of(26).in(0, 0).in(1, 0).in(2, 0),
                //     in(3, 0).in(4, 0).in(5, 0).mk()
            ]
        ));
        expect(solver.initColumn(1)).toEqual(new Column(
            1, [
                // Sum.of(45, _.range(UNIQUE_SEGMENT_LENGTH).map(rowIdx => in(rowIdx, 1)))
            ]
        ));
        expect(solver.initColumn(2)).toEqual(new Column(
            2, [
                Sum.of(10).in(0, 2).in(1, 2).mk(),
                Sum.of(2).in(3, 2).mk(),
                // Sum.of(33).in(2, 2).in(4, 2).in(5, 2),
                //     in(6, 2).in(7, 2).in(8, 2).mk()
            ]
        ));
        expect(solver.initColumn(3)).toEqual(new Column(
            3, [
                Sum.of(17).in(0, 3).in(1, 3).mk(),
                Sum.of(6).in(7, 3).in(8, 3).mk(),
                // Sum.of(22).in(2, 3).in(3, 3).in(4, 3),
                //     in(5, 3).in(6, 3).mk()
            ]
        ));
        expect(solver.initColumn(4)).toEqual(new Column(
            4, [
                // Sum.of(45, _.range(UNIQUE_SEGMENT_LENGTH).map(row => in(row, 4)))
            ]
        ));
        expect(solver.initColumn(5)).toEqual(new Column(
            5, [
                Sum.of(8).in(2, 5).in(3, 5).mk(),
                Sum.of(8).in(7, 5).mk(),
                // Sum.of(29).in(0, 5).in(1, 5).in(4, 5),
                //     in(5, 5).in(6, 5).in(8, 5).mk()
            ]
        ));
        expect(solver.initColumn(6)).toEqual(new Column(
            6, [
                Sum.of(16).in(2, 6).in(3, 6).mk(),
                // Sum.of(29).in(0, 6).in(1, 6).in(4, 6),
                //     in(5, 6).in(6, 6).in(7, 6).in(8, 6).mk()
            ]
        ));
        expect(solver.initColumn(7)).toEqual(new Column(
            7, [
                Sum.of(5).in(3, 7).in(4, 7).mk(),
                // Sum.of(40).in(0, 7).in(1, 7).in(2, 7),
                //     in(5, 7).in(6, 7).in(7, 7).in(8, 7).mk()
            ]
        ));
        expect(solver.initColumn(8)).toEqual(new Column(
            8, [
                Sum.of(11).in(0, 8).in(1, 8).mk(),
                Sum.of(19).in(3, 8).in(4, 8).in(5, 8).mk(),
                Sum.of(14).in(6, 8).in(7, 8).in(8, 8).mk(),
                // Sum.of(1).in(2, 8).mk()
            ]
        ));
    });

    test('Initialize subgrids with leftover sums', () => {
        const solver = new Solver(testProblem);
        expect(solver.initSubgrid(0)).toEqual(new Subgrid(
            0, [
                Sum.of(15).in(0, 0).in(0, 1).mk(),
                Sum.of(10).in(0, 2).in(1, 2).mk(),
                Sum.of(7).in(1, 0).in(1, 1).mk(),
                Sum.of(13).in(2, 0).in(2, 1).in(2, 2).mk()
            ]
        ));
        expect(solver.initSubgrid(1)).toEqual(new Subgrid(
            1, [
                Sum.of(17).in(0, 3).in(1, 3).mk(),
                Sum.of(13).in(0, 4).in(0, 5).in(1, 4).mk(),
                Sum.of(11).in(2, 3).in(2, 4).mk(),
                // Sum.of(4).in(1, 5).in(2, 5).mk()
            ]
        ));
        expect(solver.initSubgrid(2)).toEqual(new Subgrid(
            2, [
                Sum.of(7).in(0, 6).in(0, 7).mk(),
                Sum.of(11).in(0, 8).in(1, 8).mk(),
                Sum.of(9).in(2, 7).in(2, 8).mk(),
                // Sum.of(18).in(1, 6).in(1, 7).in(2, 6).mk()
            ]
        ));
        expect(solver.initSubgrid(3)).toEqual(new Subgrid(
            3, [
                Sum.of(4).in(3, 0).in(3, 1).mk(),
                Sum.of(2).in(3, 2).mk(),
                Sum.of(27).in(4, 0).in(4, 1).in(5, 0).in(5, 1).mk(),
                // Sum.of(12).in(4, 2).in(5, 2).mk()
            ]
        ));
        expect(solver.initSubgrid(4)).toEqual(new Subgrid(
            4, [
                Sum.of(14).in(3, 3).in(3, 4).mk(),
                Sum.of(10).in(4, 3).in(4, 4).mk(),
                // Sum.of(21).in(3, 5).in(4, 5),
                //     in(5, 3).in(5, 4).in(5, 5).mk()
            ]
        ));
        expect(solver.initSubgrid(5)).toEqual(new Subgrid(
            5, [
                Sum.of(5).in(3, 7).in(4, 7).mk(),
                Sum.of(19).in(3, 8).in(4, 8).in(5, 8).mk(),
                // Sum.of(21).in(3, 6).in(4, 6),
                //     in(5, 6).in(5, 7).mk()
            ]
        ));
        expect(solver.initSubgrid(6)).toEqual(new Subgrid(
            6, [
                Sum.of(19).in(6, 0).in(7, 0).in(8, 0).mk(),
                Sum.of(14).in(6, 1).in(7, 1).in(8, 1).in(8, 2).mk(),
                // Sum.of(12).in(6, 2).in(7, 2).mk()
            ]
        ));
        expect(solver.initSubgrid(7)).toEqual(new Subgrid(
            7, [
                Sum.of(6).in(6, 4).in(6, 5).mk(),
                Sum.of(6).in(7, 3).in(8, 3).mk(),
                Sum.of(22).in(7, 4).in(8, 4).in(8, 5).mk(),
                Sum.of(8).in(7, 5).mk(),
                // Sum.of(3).in(6, 3).mk()
            ]
        ));
        expect(solver.initSubgrid(8)).toEqual(new Subgrid(
            8, [
                Sum.of(14).in(6, 8).in(7, 8).in(8, 8).mk(),
                Sum.of(10).in(7, 6).in(7, 7).mk(),
                Sum.of(7).in(8, 6).in(8, 7).mk(),
                // Sum.of(14).in(6, 6).in(6, 7).mk()
            ]
        ));
    });
});
