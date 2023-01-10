import _ from 'lodash';
import { sudokuDotCom_dailyChallengeOf_2022_11_01 } from '../puzzle/realPuzzleSamples';
import { Cell } from '../../src/puzzle/cell';
import { Cage } from '../../src/puzzle/cage';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { RowModel } from '../../src/solver/models/elements/rowModel';
import { ColumnModel } from '../../src/solver/models/elements/columnModel';
import { NonetModel } from '../../src/solver/models/elements/nonetModel';

describe('Tests for creation and initialization of row, column and nonet models', () => {    
    test('Initialize row models', () => {
        const model = new PuzzleSolver(sudokuDotCom_dailyChallengeOf_2022_11_01).model;
        expect(model.rowModel(0)).toEqual(new RowModel(
            0, _.range(9).map(col => Cell.at(0, col)), [
                Cage.ofSum(15).at(0, 0).at(0, 1).mk(),
                Cage.ofSum(7).at(0, 6).at(0, 7).mk()
            ]
        ));
        expect(model.rowModel(1)).toEqual(new RowModel(
            1, _.range(9).map(col => Cell.at(1, col)), [
                Cage.ofSum(7).at(1, 0).at(1, 1).mk(),
                Cage.ofSum(10).at(1, 5).at(1, 6).at(1, 7).mk()
            ]
        ));
        expect(model.rowModel(2)).toEqual(new RowModel(
            2, _.range(9).map(col => Cell.at(2, col)), [
                Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).mk(),
                Cage.ofSum(11).at(2, 3).at(2, 4).mk(),
                Cage.ofSum(9).at(2, 7).at(2, 8).mk()
            ]
        ));
        expect(model.rowModel(3)).toEqual(new RowModel(
            3, _.range(9).map(col => Cell.at(3, col)), [
                Cage.ofSum(4).at(3, 0).at(3, 1).mk(),
                Cage.ofSum(2).at(3, 2).mk(),
                Cage.ofSum(14).at(3, 3).at(3, 4).mk()
            ]
        ));
        expect(model.rowModel(4)).toEqual(new RowModel(
            4, _.range(9).map(col => Cell.at(4, col)), [
                Cage.ofSum(10).at(4, 3).at(4, 4).mk()
            ]
        ));
        expect(model.rowModel(5)).toEqual(new RowModel(
            5, _.range(9).map(col => Cell.at(5, col)), []
        ));
        expect(model.rowModel(6)).toEqual(new RowModel(
            6, _.range(9).map(col => Cell.at(6, col)), [
                Cage.ofSum(6).at(6, 4).at(6, 5).mk()
            ]
        ));
        expect(model.rowModel(7)).toEqual(new RowModel(
            7, _.range(9).map(col => Cell.at(7, col)), [
                Cage.ofSum(8).at(7, 5).mk(),
                Cage.ofSum(10).at(7, 6).at(7, 7).mk()
            ]
        ));
        expect(model.rowModel(8)).toEqual(new RowModel(
            8, _.range(9).map(col => Cell.at(8, col)), [
                Cage.ofSum(7).at(8, 6).at(8, 7).mk()
            ]
        ));
    });

    test('Initialize column models', () => {
        const model = new PuzzleSolver(sudokuDotCom_dailyChallengeOf_2022_11_01).model;
        expect(model.columnModel(0)).toEqual(new ColumnModel(
            0, _.range(9).map(row => Cell.at(row, 0)), [
                Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).mk()
            ]
        ));
        expect(model.columnModel(1)).toEqual(new ColumnModel(
            1, _.range(9).map(row => Cell.at(row, 1)), []
        ));
        expect(model.columnModel(2)).toEqual(new ColumnModel(
            2, _.range(9).map(row => Cell.at(row, 2)), [
                Cage.ofSum(10).at(0, 2).at(1, 2).mk(),
                Cage.ofSum(2).at(3, 2).mk()
            ]
        ));
        expect(model.columnModel(3)).toEqual(new ColumnModel(
            3, _.range(9).map(row => Cell.at(row, 3)), [
                Cage.ofSum(17).at(0, 3).at(1, 3).mk(),
                Cage.ofSum(6).at(7, 3).at(8, 3).mk()
            ]
        ));
        expect(model.columnModel(4)).toEqual(new ColumnModel(
            4, _.range(9).map(row => Cell.at(row, 4)), []
        ));
        expect(model.columnModel(5)).toEqual(new ColumnModel(
            5, _.range(9).map(row => Cell.at(row, 5)), [
                Cage.ofSum(8).at(2, 5).at(3, 5).mk(),
                Cage.ofSum(8).at(7, 5).mk()
            ]
        ));
        expect(model.columnModel(6)).toEqual(new ColumnModel(
            6, _.range(9).map(row => Cell.at(row, 6)), [
                Cage.ofSum(16).at(2, 6).at(3, 6).mk()
            ]
        ));
        expect(model.columnModel(7)).toEqual(new ColumnModel(
            7, _.range(9).map(row => Cell.at(row, 7)), [
                Cage.ofSum(5).at(3, 7).at(4, 7).mk()
            ]
        ));
        expect(model.columnModel(8)).toEqual(new ColumnModel(
            8, _.range(9).map(row => Cell.at(row, 8)), [
                Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
                Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).mk(),
                Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).mk()
            ]
        ));
    });

    test('Initialize nonets', () => {
        const model = new PuzzleSolver(sudokuDotCom_dailyChallengeOf_2022_11_01).model;

        expect(model.nonetModel(0)).toEqual(new NonetModel(
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
        expect(model.nonetModel(1)).toEqual(new NonetModel(
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
        expect(model.nonetModel(2)).toEqual(new NonetModel(
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
        expect(model.nonetModel(3)).toEqual(new NonetModel(
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
        expect(model.nonetModel(4)).toEqual(new NonetModel(
            4, [
                Cell.at(3, 3), Cell.at(3, 4), Cell.at(3, 5),
                Cell.at(4, 3), Cell.at(4, 4), Cell.at(4, 5),
                Cell.at(5, 3), Cell.at(5, 4), Cell.at(5, 5)
            ], [
                Cage.ofSum(14).at(3, 3).at(3, 4).mk(),
                Cage.ofSum(10).at(4, 3).at(4, 4).mk()
            ]
        ));
        expect(model.nonetModel(5)).toEqual(new NonetModel(
            5, [
                Cell.at(3, 6), Cell.at(3, 7), Cell.at(3, 8),
                Cell.at(4, 6), Cell.at(4, 7), Cell.at(4, 8),
                Cell.at(5, 6), Cell.at(5, 7), Cell.at(5, 8)
            ], [
                Cage.ofSum(5).at(3, 7).at(4, 7).mk(),
                Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).mk()
            ]
        ));
        expect(model.nonetModel(6)).toEqual(new NonetModel(
            6, [
                Cell.at(6, 0), Cell.at(6, 1), Cell.at(6, 2),
                Cell.at(7, 0), Cell.at(7, 1), Cell.at(7, 2),
                Cell.at(8, 0), Cell.at(8, 1), Cell.at(8, 2)
            ], [
                Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).mk(),
                Cage.ofSum(14).at(6, 1).at(7, 1).at(8, 1).at(8, 2).mk()
            ]
        ));
        expect(model.nonetModel(7)).toEqual(new NonetModel(
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
        expect(model.nonetModel(8)).toEqual(new NonetModel(
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
});
