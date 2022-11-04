import _ from "lodash";
import { Problem, InputSum, InputCell, GRID_SIDE_LENGTH } from '../src/problem';
import { Cell, Sum, Row, Column, Subgrid, MutableSolverModel } from '../src/solver';

export const correctProblem = new Problem([
    // upper subgrids
    new InputSum(15, [ new InputCell(0, 0), new InputCell(0, 1) ]),
    new InputSum(10, [ new InputCell(0, 2), new InputCell(1, 2) ]),
    new InputSum(17, [ new InputCell(0, 3), new InputCell(1, 3) ]),
    new InputSum(13, [ new InputCell(0, 4), new InputCell(0, 5), new InputCell(1, 4) ]),
    new InputSum(7, [ new InputCell(0, 6), new InputCell(0, 7) ]),
    new InputSum(11, [ new InputCell(0, 8), new InputCell(1, 8) ]),
    new InputSum(7, [ new InputCell(1, 0), new InputCell(1, 1) ]),
    new InputSum(10, [ new InputCell(1, 5), new InputCell(1, 6), new InputCell(1, 7) ]),
    new InputSum(13, [ new InputCell(2, 0), new InputCell(2, 1), new InputCell(2, 2) ]),
    new InputSum(11, [ new InputCell(2, 3), new InputCell(2, 4) ]),
    new InputSum(8, [ new InputCell(2, 5), new InputCell(3, 5) ]),
    new InputSum(16, [ new InputCell(2, 6), new InputCell(3, 6) ]),
    new InputSum(9, [ new InputCell(2, 7), new InputCell(2, 8) ]),

    // middle subgrids
    new InputSum(4, [ new InputCell(3, 0), new InputCell(3, 1) ]),
    new InputSum(2, [ new InputCell(3, 2) ]),
    new InputSum(14, [ new InputCell(3, 3), new InputCell(3, 4) ]),
    new InputSum(5, [ new InputCell(3, 7), new InputCell(4, 7) ]),
    new InputSum(19, [ new InputCell(3, 8), new InputCell(4, 8), new InputCell(5, 8) ]),
    new InputSum(27, [ new InputCell(4, 0), new InputCell(4, 1), new InputCell(5, 0), new InputCell(5, 1) ]),
    new InputSum(14, [ new InputCell(4, 2), new InputCell(5, 2), new InputCell(5, 3) ]),
    new InputSum(10, [ new InputCell(4, 3), new InputCell(4, 4) ]),
    new InputSum(20, [ new InputCell(4, 5), new InputCell(4, 6), new InputCell(5, 4), new InputCell(5, 5) ]),
    new InputSum(22, [ new InputCell(5, 6), new InputCell(5, 7), new InputCell(6, 6), new InputCell(6, 7) ]),

    // lower subgrids
    new InputSum(19, [ new InputCell(6, 0), new InputCell(7, 0), new InputCell(8, 0) ]),
    new InputSum(14, [ new InputCell(6, 1), new InputCell(7, 1), new InputCell(8, 1), new InputCell(8, 2) ]),
    new InputSum(15, [ new InputCell(6, 2), new InputCell(6, 3), new InputCell(7, 2)  ]),
    new InputSum(6, [ new InputCell(6, 4), new InputCell(6, 5) ]),
    new InputSum(14, [ new InputCell(6, 8), new InputCell(7, 8), new InputCell(8, 8) ]),
    new InputSum(6, [ new InputCell(7, 3), new InputCell(8, 3) ]),
    new InputSum(22, [ new InputCell(7, 4), new InputCell(8, 4), new InputCell(8, 5) ]),
    new InputSum(8, [ new InputCell(7, 5) ]),
    new InputSum(10, [ new InputCell(7, 6), new InputCell(7, 7) ]),
    new InputSum(7, [ new InputCell(8, 6), new InputCell(8, 7) ])
]);

describe('Tests for solver steps', () => {
    test('Subgrid index for cells', () => {
        // north-west subgrid (0)
        _.range(0, 3).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(0);
            })
        })

        // north subgrid (1)
        _.range(0, 3).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(1);
            })
        })

        // north-east subgrid (2)
        _.range(0, 3).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(2);
            })
        })

        // east subgrid (3)
        _.range(3, 6).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(3);
            })
        })

        // center subgrid (4)
        _.range(3, 6).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(4);
            })
        })

        // west subgrid (5)
        _.range(3, 6).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(5);
            })
        })

        // south-west subgrid (6)
        _.range(6, 9).forEach(r => {
            _.range(0, 3).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(6);
            })
        })

        // south subgrid (7)
        _.range(6, 9).forEach(r => {
            _.range(3, 6).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(7);
            })
        })

        // south-east subgrid (8)
        _.range(6, 9).forEach(r => {
            _.range(6, 9).forEach(c => {
                expect(new Cell(r, c).subgridIdx).toBe(8);
            })
        })
    });
    
    test('Initialize rows with leftover sums', () => {
        const solverModel = new MutableSolverModel(correctProblem);
        expect(Row.createWithLeftoverSum(0, solverModel)).toEqual(new Row(
            0, [
                new Sum(15, [ new Cell(0, 0), new Cell(0, 1) ]),
                new Sum(7, [ new Cell(0, 6), new Cell(0, 7) ]),
                new Sum(23, [ new Cell(0, 2), new Cell(0, 3), new Cell(0, 4), new Cell(0, 5), new Cell(0, 8)])
            ]
        ));
        expect(Row.createWithLeftoverSum(1, solverModel)).toEqual(new Row(
            1, [
                new Sum(7, [ new Cell(1, 0), new Cell(1, 1) ]),
                new Sum(10, [ new Cell(1, 5), new Cell(1, 6), new Cell(1, 7) ]),
                new Sum(28, [ new Cell(1, 2), new Cell(1, 3), new Cell(1, 4), new Cell(1, 8) ])
            ]
        ));
        expect(Row.createWithLeftoverSum(2, solverModel)).toEqual(new Row(
            2, [
                new Sum(13, [ new Cell(2, 0), new Cell(2, 1), new Cell(2, 2) ]),
                new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]),
                new Sum(9, [ new Cell(2, 7), new Cell(2, 8) ]),
                new Sum(12, [ new Cell(2, 5), new Cell(2, 6) ])
            ]
        ));
        expect(Row.createWithLeftoverSum(3, solverModel)).toEqual(new Row(
            3, [
                new Sum(4, [ new Cell(3, 0), new Cell(3, 1) ]),
                new Sum(2, [ new Cell(3, 2) ]),
                new Sum(14, [ new Cell(3, 3), new Cell(3, 4) ]),
                new Sum(25, [ new Cell(3, 5), new Cell(3, 6), new Cell(3, 7), new Cell(3, 8) ])
            ]
        ));
        expect(Row.createWithLeftoverSum(4, solverModel)).toEqual(new Row(
            4, [
                new Sum(10, [ new Cell(4, 3), new Cell(4, 4) ]),
                new Sum(35, [ new Cell(4, 0), new Cell(4, 1), new Cell(4, 2), new Cell(4, 5),
                    new Cell(4, 6), new Cell(4, 7), new Cell(4, 8) ])
            ]
        ));
        expect(Row.createWithLeftoverSum(5, solverModel)).toEqual(new Row(
            5, [ new Sum(45, _.range(GRID_SIDE_LENGTH).map(colIdx => new Cell(5, colIdx))) ]
        ));
        expect(Row.createWithLeftoverSum(6, solverModel)).toEqual(new Row(
            6, [
                new Sum(6, [ new Cell(6, 4), new Cell(6, 5) ]),
                new Sum(39, [ new Cell(6, 0), new Cell(6, 1), new Cell(6, 2), new Cell(6, 3),
                    new Cell(6, 6), new Cell(6, 7), new Cell(6, 8) ])
            ]
        ));
        expect(Row.createWithLeftoverSum(7, solverModel)).toEqual(new Row(
            7, [
                new Sum(8, [ new Cell(7, 5) ]),
                new Sum(10, [ new Cell(7, 6), new Cell(7, 7) ]),
                new Sum(27, [ new Cell(7, 0), new Cell(7, 1), new Cell(7, 2), new Cell(7, 3),
                    new Cell(7, 4), new Cell(7, 8) ])
            ]
        ));
        expect(Row.createWithLeftoverSum(8, solverModel)).toEqual(new Row(
            8, [
                new Sum(7, [ new Cell(8, 6), new Cell(8, 7) ]),
                new Sum(38, [ new Cell(8, 0), new Cell(8, 1), new Cell(8, 2), new Cell(8, 3),
                    new Cell(8, 4), new Cell(8, 5), new Cell(8, 8) ])
            ]
        ));
    });

    test('Initialize columns with leftover sums', () => {
        const solverModel = new MutableSolverModel(correctProblem);
        expect(Column.createWithLeftoverSum(0, solverModel)).toEqual(new Column(
            0, [
                new Sum(19, [ new Cell(6, 0), new Cell(7, 0), new Cell(8, 0) ]),
                new Sum(26, [ new Cell(0, 0), new Cell(1, 0), new Cell(2, 0),
                    new Cell(3, 0), new Cell(4, 0), new Cell(5, 0) ])
            ]
        ));
        expect(Column.createWithLeftoverSum(1, solverModel)).toEqual(new Column(
            1, [ new Sum(45, _.range(GRID_SIDE_LENGTH).map(rowIdx => new Cell(rowIdx, 1))) ]
        ));
        expect(Column.createWithLeftoverSum(2, solverModel)).toEqual(new Column(
            2, [
                new Sum(10, [ new Cell(0, 2), new Cell(1, 2) ]),
                new Sum(2, [ new Cell(3, 2) ]),
                new Sum(33, [ new Cell(2, 2), new Cell(4, 2), new Cell(5, 2),
                    new Cell(6, 2), new Cell(7, 2), new Cell(8, 2) ])
            ]
        ));
        expect(Column.createWithLeftoverSum(3, solverModel)).toEqual(new Column(
            3, [
                new Sum(17, [ new Cell(0, 3), new Cell(1, 3) ]),
                new Sum(6, [ new Cell(7, 3), new Cell(8, 3) ]),
                new Sum(22, [ new Cell(2, 3), new Cell(3, 3), new Cell(4, 3),
                    new Cell(5, 3), new Cell(6, 3) ])
            ]
        ));
        expect(Column.createWithLeftoverSum(4, solverModel)).toEqual(new Column(
            4, [ new Sum(45, _.range(GRID_SIDE_LENGTH).map(row => new Cell(row, 4))) ]
        ));
        expect(Column.createWithLeftoverSum(5, solverModel)).toEqual(new Column(
            5, [
                new Sum(8, [ new Cell(2, 5), new Cell(3, 5) ]),
                new Sum(8, [ new Cell(7, 5) ]),
                new Sum(29, [ new Cell(0, 5), new Cell(1, 5), new Cell(4, 5),
                    new Cell(5, 5), new Cell(6, 5), new Cell(8, 5) ])
            ]
        ));
        expect(Column.createWithLeftoverSum(6, solverModel)).toEqual(new Column(
            6, [
                new Sum(16, [ new Cell(2, 6), new Cell(3, 6) ]),
                new Sum(29, [ new Cell(0, 6), new Cell(1, 6), new Cell(4, 6),
                    new Cell(5, 6), new Cell(6, 6), new Cell(7, 6), new Cell(8, 6) ])
            ]
        ));
        expect(Column.createWithLeftoverSum(7, solverModel)).toEqual(new Column(
            7, [
                new Sum(5, [ new Cell(3, 7), new Cell(4, 7) ]),
                new Sum(40, [ new Cell(0, 7), new Cell(1, 7), new Cell(2, 7),
                    new Cell(5, 7), new Cell(6, 7), new Cell(7, 7), new Cell(8, 7) ])
            ]
        ));
        expect(Column.createWithLeftoverSum(8, solverModel)).toEqual(new Column(
            8, [
                new Sum(11, [ new Cell(0, 8), new Cell(1, 8) ]),
                new Sum(19, [ new Cell(3, 8), new Cell(4, 8), new Cell(5, 8) ]),
                new Sum(14, [ new Cell(6, 8), new Cell(7, 8), new Cell(8, 8) ]),
                new Sum(1, [ new Cell(2, 8) ])
            ]
        ));
    });

    test('Initialize subgrids with leftover sums', () => {
        const solverModel = new MutableSolverModel(correctProblem);
        expect(Subgrid.createWithLeftoverSum(0, solverModel)).toEqual(new Subgrid(
            0, [
                new Sum(15, [ new Cell(0, 0), new Cell(0, 1) ]),
                new Sum(10, [ new Cell(0, 2), new Cell(1, 2) ]),
                new Sum(7, [ new Cell(1, 0), new Cell(1, 1) ]),
                new Sum(13, [ new Cell(2, 0), new Cell(2, 1), new Cell(2, 2) ])
            ]
        ));
        expect(Subgrid.createWithLeftoverSum(1, solverModel)).toEqual(new Subgrid(
            1, [
                new Sum(17, [ new Cell(0, 3), new Cell(1, 3) ]),
                new Sum(13, [ new Cell(0, 4), new Cell(0, 5), new Cell(1, 4) ]),
                new Sum(11, [ new Cell(2, 3), new Cell(2, 4) ]),
                new Sum(4, [ new Cell(1, 5), new Cell(2, 5) ])
            ]
        ));
        expect(Subgrid.createWithLeftoverSum(2, solverModel)).toEqual(new Subgrid(
            2, [
                new Sum(7, [ new Cell(0, 6), new Cell(0, 7) ]),
                new Sum(11, [ new Cell(0, 8), new Cell(1, 8) ]),
                new Sum(9, [ new Cell(2, 7), new Cell(2, 8) ]),
                new Sum(18, [ new Cell(1, 6), new Cell(1, 7), new Cell(2, 6) ])
            ]
        ));
        expect(Subgrid.createWithLeftoverSum(3, solverModel)).toEqual(new Subgrid(
            3, [
                new Sum(4, [ new Cell(3, 0), new Cell(3, 1) ]),
                new Sum(2, [ new Cell(3, 2) ]),
                new Sum(27, [ new Cell(4, 0), new Cell(4, 1), new Cell(5, 0), new Cell(5, 1) ]),
                new Sum(12, [ new Cell(4, 2), new Cell(5, 2) ])
            ]
        ));
        expect(Subgrid.createWithLeftoverSum(4, solverModel)).toEqual(new Subgrid(
            4, [
                new Sum(14, [ new Cell(3, 3), new Cell(3, 4) ]),
                new Sum(10, [ new Cell(4, 3), new Cell(4, 4) ]),
                new Sum(21, [ new Cell(3, 5), new Cell(4, 5),
                    new Cell(5, 3), new Cell(5, 4), new Cell(5, 5) ])
            ]
        ));
        expect(Subgrid.createWithLeftoverSum(5, solverModel)).toEqual(new Subgrid(
            5, [
                new Sum(5, [ new Cell(3, 7), new Cell(4, 7) ]),
                new Sum(19, [ new Cell(3, 8), new Cell(4, 8), new Cell(5, 8) ]),
                new Sum(21, [ new Cell(3, 6), new Cell(4, 6),
                    new Cell(5, 6), new Cell(5, 7) ])
            ]
        ));
        expect(Subgrid.createWithLeftoverSum(6, solverModel)).toEqual(new Subgrid(
            6, [
                new Sum(19, [ new Cell(6, 0), new Cell(7, 0), new Cell(8, 0) ]),
                new Sum(14, [ new Cell(6, 1), new Cell(7, 1), new Cell(8, 1), new Cell(8, 2) ]),
                new Sum(12, [ new Cell(6, 2), new Cell(7, 2) ])
            ]
        ));
        expect(Subgrid.createWithLeftoverSum(7, solverModel)).toEqual(new Subgrid(
            7, [
                new Sum(6, [ new Cell(6, 4), new Cell(6, 5) ]),
                new Sum(6, [ new Cell(7, 3), new Cell(8, 3) ]),
                new Sum(22, [ new Cell(7, 4), new Cell(8, 4), new Cell(8, 5) ]),
                new Sum(8, [ new Cell(7, 5) ]),
                new Sum(3, [ new Cell(6, 3) ])
            ]
        ));
        expect(Subgrid.createWithLeftoverSum(8, solverModel)).toEqual(new Subgrid(
            8, [
                new Sum(14, [ new Cell(6, 8), new Cell(7, 8), new Cell(8, 8) ]),
                new Sum(10, [ new Cell(7, 6), new Cell(7, 7) ]),
                new Sum(7, [ new Cell(8, 6), new Cell(8, 7) ]),
                new Sum(14, [ new Cell(6, 6), new Cell(6, 7) ])
            ]
        ));
    });
});
