import * as _ from 'lodash';
import { Cage } from '../../../src/puzzle/cage';
import { Cell } from '../../../src/puzzle/cell';
import { HouseModel } from '../../../src/solver/models/elements/houseModel';
import { Solver } from '../../../src/solver/solver';
import { puzzleSamples } from '../puzzle/puzzleSamples';

type ExpectedHouse = {
    idx: number;
    cells: Array<Cell>;
    cages: Array<Cage>;
};

describe('Tests for creation and initialization of row, column and nonet models', () => {
    const model = new Solver(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_11_01).model;

    test('Initialize Row Models', () => {
        expectHouseModel(model.rowModel(0), {
            idx: 0,
            cells: _.range(9).map(col => Cell.at(0, col)),
            cages: [
                Cage.ofSum(15).at(0, 0).at(0, 1).mk(),
                Cage.ofSum(7).at(0, 6).at(0, 7).mk()
            ]
        });

        expectHouseModel(model.rowModel(1), {
            idx: 1,
            cells: _.range(9).map(col => Cell.at(1, col)),
            cages: [
                Cage.ofSum(7).at(1, 0).at(1, 1).mk(),
                Cage.ofSum(10).at(1, 5).at(1, 6).at(1, 7).mk()
            ]
        });

        expectHouseModel(model.rowModel(2), {
            idx: 2,
            cells: _.range(9).map(col => Cell.at(2, col)),
            cages: [
                Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).mk(),
                Cage.ofSum(11).at(2, 3).at(2, 4).mk(),
                Cage.ofSum(9).at(2, 7).at(2, 8).mk()
            ]
        });

        expectHouseModel(model.rowModel(3), {
            idx: 3,
            cells: _.range(9).map(col => Cell.at(3, col)),
            cages: [
                Cage.ofSum(4).at(3, 0).at(3, 1).mk(),
                Cage.ofSum(2).at(3, 2).mk(),
                Cage.ofSum(14).at(3, 3).at(3, 4).mk()
            ]
        });

        expectHouseModel(model.rowModel(4), {
            idx: 4,
            cells: _.range(9).map(col => Cell.at(4, col)),
            cages: [
                Cage.ofSum(10).at(4, 3).at(4, 4).mk()
            ]
        });

        expectHouseModel(model.rowModel(5), {
            idx: 5,
            cells: _.range(9).map(col => Cell.at(5, col)),
            cages: []
        });

        expectHouseModel(model.rowModel(6), {
            idx: 6,
            cells: _.range(9).map(col => Cell.at(6, col)),
            cages: [
                Cage.ofSum(6).at(6, 4).at(6, 5).mk()
            ]
        });

        expectHouseModel(model.rowModel(7), {
            idx: 7,
            cells: _.range(9).map(col => Cell.at(7, col)),
            cages: [
                Cage.ofSum(8).at(7, 5).mk(),
                Cage.ofSum(10).at(7, 6).at(7, 7).mk()
            ]
        });

        expectHouseModel(model.rowModel(8), {
            idx: 8,
            cells: _.range(9).map(col => Cell.at(8, col)),
            cages: [
                Cage.ofSum(7).at(8, 6).at(8, 7).mk()
            ]
        });
    });

    test('Initialize ColumnModels', () => {
        expectHouseModel(model.columnModel(0), {
            idx: 0,
            cells: _.range(9).map(row => Cell.at(row, 0)),
            cages: [
                Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).mk()
            ]
        });

        expectHouseModel(model.columnModel(1), {
            idx: 1,
            cells: _.range(9).map(row => Cell.at(row, 1)),
            cages: []
        });

        expectHouseModel(model.columnModel(2), {
            idx: 2,
            cells: _.range(9).map(row => Cell.at(row, 2)),
            cages: [
                Cage.ofSum(10).at(0, 2).at(1, 2).mk(),
                Cage.ofSum(2).at(3, 2).mk()
            ]
        });

        expectHouseModel(model.columnModel(3), {
            idx: 3,
            cells: _.range(9).map(row => Cell.at(row, 3)),
            cages: [
                Cage.ofSum(17).at(0, 3).at(1, 3).mk(),
                Cage.ofSum(6).at(7, 3).at(8, 3).mk()
            ]
        });

        expectHouseModel(model.columnModel(4), {
            idx: 4,
            cells: _.range(9).map(row => Cell.at(row, 4)),
            cages: []
        });

        expectHouseModel(model.columnModel(5), {
            idx: 5,
            cells: _.range(9).map(row => Cell.at(row, 5)),
            cages: [
                Cage.ofSum(8).at(2, 5).at(3, 5).mk(),
                Cage.ofSum(8).at(7, 5).mk()
            ]
        });

        expectHouseModel(model.columnModel(6), {
            idx: 6,
            cells: _.range(9).map(row => Cell.at(row, 6)),
            cages: [
                Cage.ofSum(16).at(2, 6).at(3, 6).mk()
            ]
        });

        expectHouseModel(model.columnModel(7), {
            idx: 7,
            cells: _.range(9).map(row => Cell.at(row, 7)),
            cages: [
                Cage.ofSum(5).at(3, 7).at(4, 7).mk()
            ]
        });

        expectHouseModel(model.columnModel(8), {
            idx: 8,
            cells: _.range(9).map(row => Cell.at(row, 8)),
            cages: [
                Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
                Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).mk(),
                Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).mk()
            ]
        });
    });

    test('Initialize NonetModels', () => {
        expectHouseModel(model.nonetModel(0), {
            idx: 0,
            cells: [
                Cell.at(0, 0), Cell.at(0, 1), Cell.at(0, 2),
                Cell.at(1, 0), Cell.at(1, 1), Cell.at(1, 2),
                Cell.at(2, 0), Cell.at(2, 1), Cell.at(2, 2)
            ],
            cages: [
                Cage.ofSum(15).at(0, 0).at(0, 1).mk(),
                Cage.ofSum(10).at(0, 2).at(1, 2).mk(),
                Cage.ofSum(7).at(1, 0).at(1, 1).mk(),
                Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).mk()
            ]
        });

        expectHouseModel(model.nonetModel(1), {
            idx: 1,
            cells: [
                Cell.at(0, 3), Cell.at(0, 4), Cell.at(0, 5),
                Cell.at(1, 3), Cell.at(1, 4), Cell.at(1, 5),
                Cell.at(2, 3), Cell.at(2, 4), Cell.at(2, 5)
            ],
            cages: [
                Cage.ofSum(17).at(0, 3).at(1, 3).mk(),
                Cage.ofSum(13).at(0, 4).at(0, 5).at(1, 4).mk(),
                Cage.ofSum(11).at(2, 3).at(2, 4).mk()
            ]
        });

        expectHouseModel(model.nonetModel(2), {
            idx: 2,
            cells: [
                Cell.at(0, 6), Cell.at(0, 7), Cell.at(0, 8),
                Cell.at(1, 6), Cell.at(1, 7), Cell.at(1, 8),
                Cell.at(2, 6), Cell.at(2, 7), Cell.at(2, 8)
            ],
            cages: [
                Cage.ofSum(7).at(0, 6).at(0, 7).mk(),
                Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
                Cage.ofSum(9).at(2, 7).at(2, 8).mk()
            ]
        });

        expectHouseModel(model.nonetModel(3), {
            idx: 3,
            cells: [
                Cell.at(3, 0), Cell.at(3, 1), Cell.at(3, 2),
                Cell.at(4, 0), Cell.at(4, 1), Cell.at(4, 2),
                Cell.at(5, 0), Cell.at(5, 1), Cell.at(5, 2)
            ],
            cages: [
                Cage.ofSum(4).at(3, 0).at(3, 1).mk(),
                Cage.ofSum(2).at(3, 2).mk(),
                Cage.ofSum(27).at(4, 0).at(4, 1).at(5, 0).at(5, 1).mk()
            ]
        });

        expectHouseModel(model.nonetModel(4), {
            idx: 4,
            cells: [
                Cell.at(3, 3), Cell.at(3, 4), Cell.at(3, 5),
                Cell.at(4, 3), Cell.at(4, 4), Cell.at(4, 5),
                Cell.at(5, 3), Cell.at(5, 4), Cell.at(5, 5)
            ],
            cages: [
                Cage.ofSum(14).at(3, 3).at(3, 4).mk(),
                Cage.ofSum(10).at(4, 3).at(4, 4).mk()
            ]
        });

        expectHouseModel(model.nonetModel(5), {
            idx: 5,
            cells: [
                Cell.at(3, 6), Cell.at(3, 7), Cell.at(3, 8),
                Cell.at(4, 6), Cell.at(4, 7), Cell.at(4, 8),
                Cell.at(5, 6), Cell.at(5, 7), Cell.at(5, 8)
            ],
            cages: [
                Cage.ofSum(5).at(3, 7).at(4, 7).mk(),
                Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).mk()
            ]
        });

        expectHouseModel(model.nonetModel(6), {
            idx: 6,
            cells: [
                Cell.at(6, 0), Cell.at(6, 1), Cell.at(6, 2),
                Cell.at(7, 0), Cell.at(7, 1), Cell.at(7, 2),
                Cell.at(8, 0), Cell.at(8, 1), Cell.at(8, 2)
            ],
            cages: [
                Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).mk(),
                Cage.ofSum(14).at(6, 1).at(7, 1).at(8, 1).at(8, 2).mk()
            ]
        });

        expectHouseModel(model.nonetModel(7), {
            idx: 7,
            cells: [
                Cell.at(6, 3), Cell.at(6, 4), Cell.at(6, 5),
                Cell.at(7, 3), Cell.at(7, 4), Cell.at(7, 5),
                Cell.at(8, 3), Cell.at(8, 4), Cell.at(8, 5)
            ],
            cages: [
                Cage.ofSum(6).at(6, 4).at(6, 5).mk(),
                Cage.ofSum(6).at(7, 3).at(8, 3).mk(),
                Cage.ofSum(22).at(7, 4).at(8, 4).at(8, 5).mk(),
                Cage.ofSum(8).at(7, 5).mk()
            ]
        });

        expectHouseModel(model.nonetModel(8), {
            idx: 8,
            cells: [
                Cell.at(6, 6), Cell.at(6, 7), Cell.at(6, 8),
                Cell.at(7, 6), Cell.at(7, 7), Cell.at(7, 8),
                Cell.at(8, 6), Cell.at(8, 7), Cell.at(8, 8)
            ],
            cages: [
                Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).mk(),
                Cage.ofSum(10).at(7, 6).at(7, 7).mk(),
                Cage.ofSum(7).at(8, 6).at(8, 7).mk()
            ]
        });
    });

    const expectHouseModel = (houseM: HouseModel, expected: ExpectedHouse) => {
        expect(houseM).toEqual(expect.objectContaining({
            idx: expected.idx,
            cells: expected.cells
        }));
        expect(houseM.cageModels.map(cageM => cageM.cage)).toEqual(expected.cages);
    };
});
