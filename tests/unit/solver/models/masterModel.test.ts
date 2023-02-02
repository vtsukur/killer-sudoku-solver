import * as _ from 'lodash';
import { Cage, Cages } from '../../../../src/puzzle/cage';
import { Cell, Cells } from '../../../../src/puzzle/cell';
import { House } from '../../../../src/puzzle/house';
import { NumSet } from '../../../../src/solver/math';
import { HouseModel } from '../../../../src/solver/models/elements/houseModel';
import { MasterModel } from '../../../../src/solver/models/masterModel';
import { Context } from '../../../../src/solver/strategies/context';
import { MasterStrategy } from '../../../../src/solver/strategies/masterStrategy';
import { CageSlicer } from '../../../../src/solver/transform/cageSlicer';
import { puzzleSamples } from '../../puzzle/puzzleSamples';

type ExpectedHouse = {
    index: number;
    cells: Cells;
    cages: Cages;
};

describe('Tests for master model', () => {
    const model = new MasterModel(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_11_01);

    test('Initialization of CellModels (shallow coverage)', () => {
        const aCellModel = model.cellModelAt(2, 3);
        expect(aCellModel.cell).toEqual(Cell.at(2, 3));
        expect(aCellModel.placedNum).toBe(undefined);
        expect(aCellModel.numOpts()).toEqual(new NumSet(2, 3, 4, 5, 6, 7, 8, 9));
    });

    test('Initialization of RowModels', () => {
        expect(model.rowModels.length).toBe(House.COUNT_OF_ONE_TYPE_PER_GRID);

        expectHouseM(model.rowModel(0), {
            index: 0,
            cells: _.range(9).map(col => Cell.at(0, col)),
            cages: [
                Cage.ofSum(15).at(0, 0).at(0, 1).new(),
                Cage.ofSum(7).at(0, 6).at(0, 7).new()
            ]
        });

        expectHouseM(model.rowModel(1), {
            index: 1,
            cells: _.range(9).map(col => Cell.at(1, col)),
            cages: [
                Cage.ofSum(7).at(1, 0).at(1, 1).new(),
                Cage.ofSum(10).at(1, 5).at(1, 6).at(1, 7).new()
            ]
        });

        expectHouseM(model.rowModel(2), {
            index: 2,
            cells: _.range(9).map(col => Cell.at(2, col)),
            cages: [
                Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).new(),
                Cage.ofSum(11).at(2, 3).at(2, 4).new(),
                Cage.ofSum(9).at(2, 7).at(2, 8).new()
            ]
        });

        expectHouseM(model.rowModel(3), {
            index: 3,
            cells: _.range(9).map(col => Cell.at(3, col)),
            cages: [
                Cage.ofSum(4).at(3, 0).at(3, 1).new(),
                Cage.ofSum(2).at(3, 2).new(),
                Cage.ofSum(14).at(3, 3).at(3, 4).new()
            ]
        });

        expectHouseM(model.rowModel(4), {
            index: 4,
            cells: _.range(9).map(col => Cell.at(4, col)),
            cages: [
                Cage.ofSum(10).at(4, 3).at(4, 4).new()
            ]
        });

        expectHouseM(model.rowModel(5), {
            index: 5,
            cells: _.range(9).map(col => Cell.at(5, col)),
            cages: []
        });

        expectHouseM(model.rowModel(6), {
            index: 6,
            cells: _.range(9).map(col => Cell.at(6, col)),
            cages: [
                Cage.ofSum(6).at(6, 4).at(6, 5).new()
            ]
        });

        expectHouseM(model.rowModel(7), {
            index: 7,
            cells: _.range(9).map(col => Cell.at(7, col)),
            cages: [
                Cage.ofSum(8).at(7, 5).new(),
                Cage.ofSum(10).at(7, 6).at(7, 7).new()
            ]
        });

        expectHouseM(model.rowModel(8), {
            index: 8,
            cells: _.range(9).map(col => Cell.at(8, col)),
            cages: [
                Cage.ofSum(7).at(8, 6).at(8, 7).new()
            ]
        });
    });

    test('Initialization of ColumnModels', () => {
        expect(model.columnModels.length).toBe(House.COUNT_OF_ONE_TYPE_PER_GRID);

        expectHouseM(model.columnModel(0), {
            index: 0,
            cells: _.range(9).map(row => Cell.at(row, 0)),
            cages: [
                Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).new()
            ]
        });

        expectHouseM(model.columnModel(1), {
            index: 1,
            cells: _.range(9).map(row => Cell.at(row, 1)),
            cages: []
        });

        expectHouseM(model.columnModel(2), {
            index: 2,
            cells: _.range(9).map(row => Cell.at(row, 2)),
            cages: [
                Cage.ofSum(10).at(0, 2).at(1, 2).new(),
                Cage.ofSum(2).at(3, 2).new()
            ]
        });

        expectHouseM(model.columnModel(3), {
            index: 3,
            cells: _.range(9).map(row => Cell.at(row, 3)),
            cages: [
                Cage.ofSum(17).at(0, 3).at(1, 3).new(),
                Cage.ofSum(6).at(7, 3).at(8, 3).new()
            ]
        });

        expectHouseM(model.columnModel(4), {
            index: 4,
            cells: _.range(9).map(row => Cell.at(row, 4)),
            cages: []
        });

        expectHouseM(model.columnModel(5), {
            index: 5,
            cells: _.range(9).map(row => Cell.at(row, 5)),
            cages: [
                Cage.ofSum(8).at(2, 5).at(3, 5).new(),
                Cage.ofSum(8).at(7, 5).new()
            ]
        });

        expectHouseM(model.columnModel(6), {
            index: 6,
            cells: _.range(9).map(row => Cell.at(row, 6)),
            cages: [
                Cage.ofSum(16).at(2, 6).at(3, 6).new()
            ]
        });

        expectHouseM(model.columnModel(7), {
            index: 7,
            cells: _.range(9).map(row => Cell.at(row, 7)),
            cages: [
                Cage.ofSum(5).at(3, 7).at(4, 7).new()
            ]
        });

        expectHouseM(model.columnModel(8), {
            index: 8,
            cells: _.range(9).map(row => Cell.at(row, 8)),
            cages: [
                Cage.ofSum(11).at(0, 8).at(1, 8).new(),
                Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).new(),
                Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).new()
            ]
        });
    });

    test('Initialization of NonetModels', () => {
        expect(model.nonetModels.length).toBe(House.COUNT_OF_ONE_TYPE_PER_GRID);

        expectHouseM(model.nonetModel(0), {
            index: 0,
            cells: [
                Cell.at(0, 0), Cell.at(0, 1), Cell.at(0, 2),
                Cell.at(1, 0), Cell.at(1, 1), Cell.at(1, 2),
                Cell.at(2, 0), Cell.at(2, 1), Cell.at(2, 2)
            ],
            cages: [
                Cage.ofSum(15).at(0, 0).at(0, 1).new(),
                Cage.ofSum(10).at(0, 2).at(1, 2).new(),
                Cage.ofSum(7).at(1, 0).at(1, 1).new(),
                Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).new()
            ]
        });

        expectHouseM(model.nonetModel(1), {
            index: 1,
            cells: [
                Cell.at(0, 3), Cell.at(0, 4), Cell.at(0, 5),
                Cell.at(1, 3), Cell.at(1, 4), Cell.at(1, 5),
                Cell.at(2, 3), Cell.at(2, 4), Cell.at(2, 5)
            ],
            cages: [
                Cage.ofSum(17).at(0, 3).at(1, 3).new(),
                Cage.ofSum(13).at(0, 4).at(0, 5).at(1, 4).new(),
                Cage.ofSum(11).at(2, 3).at(2, 4).new()
            ]
        });

        expectHouseM(model.nonetModel(2), {
            index: 2,
            cells: [
                Cell.at(0, 6), Cell.at(0, 7), Cell.at(0, 8),
                Cell.at(1, 6), Cell.at(1, 7), Cell.at(1, 8),
                Cell.at(2, 6), Cell.at(2, 7), Cell.at(2, 8)
            ],
            cages: [
                Cage.ofSum(7).at(0, 6).at(0, 7).new(),
                Cage.ofSum(11).at(0, 8).at(1, 8).new(),
                Cage.ofSum(9).at(2, 7).at(2, 8).new()
            ]
        });

        expectHouseM(model.nonetModel(3), {
            index: 3,
            cells: [
                Cell.at(3, 0), Cell.at(3, 1), Cell.at(3, 2),
                Cell.at(4, 0), Cell.at(4, 1), Cell.at(4, 2),
                Cell.at(5, 0), Cell.at(5, 1), Cell.at(5, 2)
            ],
            cages: [
                Cage.ofSum(4).at(3, 0).at(3, 1).new(),
                Cage.ofSum(2).at(3, 2).new(),
                Cage.ofSum(27).at(4, 0).at(4, 1).at(5, 0).at(5, 1).new()
            ]
        });

        expectHouseM(model.nonetModel(4), {
            index: 4,
            cells: [
                Cell.at(3, 3), Cell.at(3, 4), Cell.at(3, 5),
                Cell.at(4, 3), Cell.at(4, 4), Cell.at(4, 5),
                Cell.at(5, 3), Cell.at(5, 4), Cell.at(5, 5)
            ],
            cages: [
                Cage.ofSum(14).at(3, 3).at(3, 4).new(),
                Cage.ofSum(10).at(4, 3).at(4, 4).new()
            ]
        });

        expectHouseM(model.nonetModel(5), {
            index: 5,
            cells: [
                Cell.at(3, 6), Cell.at(3, 7), Cell.at(3, 8),
                Cell.at(4, 6), Cell.at(4, 7), Cell.at(4, 8),
                Cell.at(5, 6), Cell.at(5, 7), Cell.at(5, 8)
            ],
            cages: [
                Cage.ofSum(5).at(3, 7).at(4, 7).new(),
                Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).new()
            ]
        });

        expectHouseM(model.nonetModel(6), {
            index: 6,
            cells: [
                Cell.at(6, 0), Cell.at(6, 1), Cell.at(6, 2),
                Cell.at(7, 0), Cell.at(7, 1), Cell.at(7, 2),
                Cell.at(8, 0), Cell.at(8, 1), Cell.at(8, 2)
            ],
            cages: [
                Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).new(),
                Cage.ofSum(14).at(6, 1).at(7, 1).at(8, 1).at(8, 2).new()
            ]
        });

        expectHouseM(model.nonetModel(7), {
            index: 7,
            cells: [
                Cell.at(6, 3), Cell.at(6, 4), Cell.at(6, 5),
                Cell.at(7, 3), Cell.at(7, 4), Cell.at(7, 5),
                Cell.at(8, 3), Cell.at(8, 4), Cell.at(8, 5)
            ],
            cages: [
                Cage.ofSum(6).at(6, 4).at(6, 5).new(),
                Cage.ofSum(6).at(7, 3).at(8, 3).new(),
                Cage.ofSum(22).at(7, 4).at(8, 4).at(8, 5).new(),
                Cage.ofSum(8).at(7, 5).new()
            ]
        });

        expectHouseM(model.nonetModel(8), {
            index: 8,
            cells: [
                Cell.at(6, 6), Cell.at(6, 7), Cell.at(6, 8),
                Cell.at(7, 6), Cell.at(7, 7), Cell.at(7, 8),
                Cell.at(8, 6), Cell.at(8, 7), Cell.at(8, 8)
            ],
            cages: [
                Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).new(),
                Cage.ofSum(10).at(7, 6).at(7, 7).new(),
                Cage.ofSum(7).at(8, 6).at(8, 7).new()
            ]
        });
    });

    const expectHouseM = (houseM: HouseModel, expected: ExpectedHouse) => {
        expect(houseM).toEqual(expect.objectContaining({
            index: expected.index,
            cells: expected.cells
        }));
        expect(houseM.cageModels.map(cageM => cageM.cage)).toEqual(expected.cages);
    };

    test('Solved MasterModel has placed nums and all Cages sliced (shallow coverage)', () => {
        const puzzle = puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_11_01;

        // emulating Solver
        const model = new MasterModel(puzzle);
        const ctx = new Context(model, new CageSlicer(model));
        new MasterStrategy(ctx).execute();

        expect(model.cellModelAt(2, 7).placedNum).toBe(8);
        expect(model.cellModelAt(2, 7).solved).toBe(true);

        _.range(House.COUNT_OF_ONE_TYPE_PER_GRID).forEach(index => {
            expect(model.rowModel(index).cageModels.length).toBe(House.CELL_COUNT);
            expect(model.columnModel(index).cageModels.length).toBe(House.CELL_COUNT);
            expect(model.nonetModel(index).cageModels.length).toBe(House.CELL_COUNT);
        });
    });
});
