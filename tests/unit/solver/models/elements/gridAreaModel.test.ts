import { Cage, ReadonlyCages } from '../../../../../src/puzzle/cage';
import { CellIndicesCheckingSet } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { GridAreaModel } from '../../../../../src/solver/models/elements/gridAreaModel';

describe('Unit tests for `GridAreaModel`', () => {
    test('Creation of instance with all input `Cage`s forming non-overlapping area and all derived `Cage`s forming overlapping area', () => {
        const cages = [
            Cage.ofSum(7).at(0, 0).at(0, 1).new(),
            Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).new(),
            Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).new(),
            Cage.ofSum(21).at(0, 2).at(1, 0).at(1, 1).at(1, 2).setIsInput(false).new(),
            Cage.ofSum(17).at(2, 0).at(2, 1).at(2, 2).setIsInput(false).new()
        ];

        expectGridAreaModel(GridAreaModel.from(cages),
            [
                Cage.ofSum(7).at(0, 0).at(0, 1).new(),
                Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).new(),
                Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).new()
            ],
            [
                Cage.ofSum(21).at(0, 2).at(1, 0).at(1, 1).at(1, 2).setIsInput(false).new(),
                Cage.ofSum(17).at(2, 0).at(2, 1).at(2, 2).setIsInput(false).new()
            ]
        );
    });

    test('Creation of instance from `CageModel`s', () => {
        const cageMs = [
            new CageModel(Cage.ofSum(7).at(0, 0).at(0, 1).new(), []),
            new CageModel(Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).new(), []),
            new CageModel(Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).new(), []),
            new CageModel(Cage.ofSum(21).at(0, 2).at(1, 0).at(1, 1).at(1, 2).setIsInput(false).new(), []),
            new CageModel(Cage.ofSum(17).at(2, 0).at(2, 1).at(2, 2).setIsInput(false).new(), [])
        ];

        expectGridAreaModel(GridAreaModel.fromCageModels(cageMs),
            [
                Cage.ofSum(7).at(0, 0).at(0, 1).new(),
                Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).new(),
                Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).new()
            ],
            [
                Cage.ofSum(21).at(0, 2).at(1, 0).at(1, 1).at(1, 2).setIsInput(false).new(),
                Cage.ofSum(17).at(2, 0).at(2, 1).at(2, 2).setIsInput(false).new()
            ]
        );
    });

    test('Creation of instance with all input `Cage`s forming non-overlapping area and all derived `Cage`s forming overlapping area', () => {
        const newCageM = (cage: Cage) => new CageModel(cage, []);
        const cageMs = [
            newCageM(Cage.ofSum(7).at(0, 0).at(0, 1).new()),
            newCageM(Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).new()),
            newCageM(Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).new()),
            newCageM(Cage.ofSum(21).at(0, 2).at(1, 0).at(1, 1).at(1, 2).setIsInput(false).new()),
            newCageM(Cage.ofSum(17).at(2, 0).at(2, 1).at(2, 2).setIsInput(false).new())
        ];

        expectGridAreaModel(GridAreaModel.fromCageModels(cageMs),
            [
                Cage.ofSum(7).at(0, 0).at(0, 1).new(),
                Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).new(),
                Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).new()
            ],
            [
                Cage.ofSum(21).at(0, 2).at(1, 0).at(1, 1).at(1, 2).setIsInput(false).new(),
                Cage.ofSum(17).at(2, 0).at(2, 1).at(2, 2).setIsInput(false).new()
            ]
        );
    });

    test('Sudoku.com 2022-10-19: Creation of instance with 2 derived `Cage`s maximizing non-overlapping area', () => {
        const cages = [
            Cage.ofSum(9).at(7, 8).at(8, 8).new(),
            Cage.ofSum(11).at(8, 7).at(8, 8).setIsInput(false).new(),
            Cage.ofSum(15).at(7, 7).at(8, 7).new(),
            Cage.ofSum(13).at(6, 6).at(7, 6).at(8, 6).setIsInput(false).new(),
            Cage.ofSum(13).at(7, 7).at(7, 8).setIsInput(false).new(),
            Cage.ofSum(8).at(6, 7).at(6, 8).setIsInput(false).new()
        ];

        expectGridAreaModel(GridAreaModel.from(cages),
            [
                Cage.ofSum(9).at(7, 8).at(8, 8).new(),
                Cage.ofSum(15).at(7, 7).at(8, 7).new(),
                Cage.ofSum(13).at(6, 6).at(7, 6).at(8, 6).setIsInput(false).new(),
                Cage.ofSum(8).at(6, 7).at(6, 8).setIsInput(false).new()
            ],
            [
                Cage.ofSum(11).at(8, 7).at(8, 8).setIsInput(false).new(),
                Cage.ofSum(13).at(7, 7).at(7, 8).setIsInput(false).new()
            ]
        );
    });

    test('Creation of instance for the big area with all input `Cage`s forming non-overlapping area and all derived `Cage`s forming overlapping area', () => {
        const cages = [
            Cage.ofSum(12).at(2, 3).at(3, 2).at(3, 3).new(),
            Cage.ofSum(14).at(2, 4).at(2, 5).at(2, 6).at(3, 4).new(),
            Cage.ofSum(5).at(5, 0).at(5, 1).new(),
            Cage.ofSum(24).at(4, 4).at(4, 5).at(5, 4).new(),
            Cage.ofSum(7).at(3, 5).at(3, 6).new(),
            Cage.ofSum(12).at(4, 6).at(4, 7).at(4, 8).new(),
            Cage.ofSum(20).at(2, 6).at(3, 2).at(3, 3).at(3, 4).setIsInput(false).new(),
            Cage.ofSum(20).at(2, 4).at(2, 5).at(3, 4).at(3, 7).at(3, 8).setIsInput(false).new(),
            Cage.ofSum(12).at(3, 0).at(3, 1).new(),
            Cage.ofSum(10).at(4, 0).at(4, 1).new()
        ];

        expectGridAreaModel(GridAreaModel.from(cages, 4),
            [
                Cage.ofSum(12).at(2, 3).at(3, 2).at(3, 3).new(),
                Cage.ofSum(14).at(2, 4).at(2, 5).at(2, 6).at(3, 4).new(),
                Cage.ofSum(5).at(5, 0).at(5, 1).new(),
                Cage.ofSum(24).at(4, 4).at(4, 5).at(5, 4).new(),
                Cage.ofSum(7).at(3, 5).at(3, 6).new(),
                Cage.ofSum(12).at(4, 6).at(4, 7).at(4, 8).new(),
                Cage.ofSum(12).at(3, 0).at(3, 1).new(),
                Cage.ofSum(10).at(4, 0).at(4, 1).new()
            ],
            [
                Cage.ofSum(20).at(2, 6).at(3, 2).at(3, 3).at(3, 4).setIsInput(false).new(),
                Cage.ofSum(20).at(2, 4).at(2, 5).at(3, 4).at(3, 7).at(3, 8).setIsInput(false).new()
            ]
        );
    });

    test('Sudoku.com random challenge: creation of instance for the big area with many `Cage`s with all input `Cage`s forming non-overlapping area and all derived `Cage`s forming overlapping area', () => {
        const cages = [
            Cage.ofSum(6).at(0, 5).at(0, 6).new(),
            Cage.ofSum(18).at(1, 5).at(1, 6).at(2, 5).at(2, 6).new(),
            Cage.ofSum(16).at(0, 7).at(0, 8).new(),
            Cage.ofSum(9).at(1, 7).at(2, 7).new(),
            Cage.ofSum(10).at(1, 8).at(2, 8).new(),
            Cage.ofSum(4).at(3, 5).at(3, 6).new(),
            Cage.ofSum(21).at(5, 5).at(5, 6).at(6, 5).new(),
            Cage.ofSum(9).at(3, 7).at(3, 8).new(),
            Cage.ofSum(15).at(4, 6).at(4, 7).at(4, 8).new(),
            Cage.ofSum(13).at(5, 7).at(5, 8).at(6, 8).new(),
            Cage.ofSum(11).at(7, 5).at(7, 6).new(),
            Cage.ofSum(5).at(8, 5).at(8, 6).new(),
            Cage.ofSum(10).at(6, 6).at(6, 7).new(),
            Cage.ofSum(13).at(7, 7).at(8, 7).new(),
            Cage.ofSum(11).at(7, 8).at(8, 8).new(),
            Cage.ofSum(14).at(0, 5).at(1, 5).at(2, 5).setIsInput(false).new(),
            Cage.ofSum(18).at(5, 7).at(5, 8).at(7, 5).at(8, 5).setIsInput(false).new(),
            Cage.ofSum(18).at(3, 6).at(5, 6).at(6, 5).setIsInput(false).new(),
            Cage.ofSum(24).at(5, 5).at(5, 6).at(5, 7).at(5, 8).setIsInput(false).new(),
            Cage.ofSum(15).at(7, 7).at(7, 8).setIsInput(false).new(),
            Cage.ofSum(10).at(6, 5).at(6, 8).setIsInput(false).new(),
            Cage.ofSum(7).at(3, 5).at(5, 5).setIsInput(false).new(),
            Cage.ofSum(9).at(8, 7).at(8, 8).setIsInput(false).new()
        ];

        expectGridAreaModel(GridAreaModel.from(cages, 4),
            [
                Cage.ofSum(6).at(0, 5).at(0, 6).new(),
                Cage.ofSum(18).at(1, 5).at(1, 6).at(2, 5).at(2, 6).new(),
                Cage.ofSum(16).at(0, 7).at(0, 8).new(),
                Cage.ofSum(9).at(1, 7).at(2, 7).new(),
                Cage.ofSum(10).at(1, 8).at(2, 8).new(),
                Cage.ofSum(4).at(3, 5).at(3, 6).new(),
                Cage.ofSum(21).at(5, 5).at(5, 6).at(6, 5).new(),
                Cage.ofSum(9).at(3, 7).at(3, 8).new(),
                Cage.ofSum(15).at(4, 6).at(4, 7).at(4, 8).new(),
                Cage.ofSum(13).at(5, 7).at(5, 8).at(6, 8).new(),
                Cage.ofSum(11).at(7, 5).at(7, 6).new(),
                Cage.ofSum(5).at(8, 5).at(8, 6).new(),
                Cage.ofSum(10).at(6, 6).at(6, 7).new(),
                Cage.ofSum(13).at(7, 7).at(8, 7).new(),
                Cage.ofSum(11).at(7, 8).at(8, 8).new()
            ],
            [
                Cage.ofSum(14).at(0, 5).at(1, 5).at(2, 5).setIsInput(false).new(),
                Cage.ofSum(18).at(5, 7).at(5, 8).at(7, 5).at(8, 5).setIsInput(false).new(),
                Cage.ofSum(18).at(3, 6).at(5, 6).at(6, 5).setIsInput(false).new(),
                Cage.ofSum(24).at(5, 5).at(5, 6).at(5, 7).at(5, 8).setIsInput(false).new(),
                Cage.ofSum(15).at(7, 7).at(7, 8).setIsInput(false).new(),
                Cage.ofSum(10).at(6, 5).at(6, 8).setIsInput(false).new(),
                Cage.ofSum(7).at(3, 5).at(5, 5).setIsInput(false).new(),
                Cage.ofSum(9).at(8, 7).at(8, 8).setIsInput(false).new()
            ]
        );
    });

    test('Sudoku.com 2022-08-12: creation of instance for the big area with 12 `Cage`s and all are derived', () => {
        const cages = [
            Cage.ofSum(32).at(0, 3).at(1, 3).at(2, 3).at(3, 0).at(4, 0).setIsInput(false).new(),
            Cage.ofSum(14).at(0, 4).at(0, 5).at(2, 5).setIsInput(false).new(),
            Cage.ofSum(24).at(2, 0).at(5, 3).at(6, 0).at(6, 1).at(6, 2).setIsInput(false).new(),
            Cage.ofSum(21).at(5, 0).at(5, 1).at(5, 2).at(5, 3).setIsInput(false).new(),
            Cage.ofSum(14).at(1, 0).at(1, 1).setIsInput(false).new(),
            Cage.ofSum(22).at(3, 0).at(3, 4).at(4, 0).setIsInput(false).new(),
            Cage.ofSum(22).at(4, 0).at(4, 1).at(4, 2).at(4, 3).setIsInput(false).new(),
            Cage.ofSum(23).at(2, 0).at(3, 0).at(3, 1).at(3, 2).at(3, 3).setIsInput(false).new(),
            Cage.ofSum(12).at(2, 0).at(2, 4).setIsInput(false).new(),
            Cage.ofSum(4).at(0, 0).at(0, 1).setIsInput(false).new(),
            Cage.ofSum(25).at(3, 0).at(3, 1).at(3, 2).at(3, 3).at(3, 4).setIsInput(false).new(),
            Cage.ofSum(25).at(2, 2).at(2, 3).at(5, 2).at(5, 3).at(6, 2).setIsInput(false).new()
        ];

        expectGridAreaModel(GridAreaModel.from(cages, 6),
            [
                Cage.ofSum(14).at(0, 4).at(0, 5).at(2, 5).setIsInput(false).new(),
                Cage.ofSum(14).at(1, 0).at(1, 1).setIsInput(false).new(),
                Cage.ofSum(22).at(4, 0).at(4, 1).at(4, 2).at(4, 3).setIsInput(false).new(),
                Cage.ofSum(12).at(2, 0).at(2, 4).setIsInput(false).new(),
                Cage.ofSum(4).at(0, 0).at(0, 1).setIsInput(false).new(),
                Cage.ofSum(25).at(3, 0).at(3, 1).at(3, 2).at(3, 3).at(3, 4).setIsInput(false).new(),
                Cage.ofSum(25).at(2, 2).at(2, 3).at(5, 2).at(5, 3).at(6, 2).setIsInput(false).new()
            ],
            [
                Cage.ofSum(32).at(0, 3).at(1, 3).at(2, 3).at(3, 0).at(4, 0).setIsInput(false).new(),
                Cage.ofSum(24).at(2, 0).at(5, 3).at(6, 0).at(6, 1).at(6, 2).setIsInput(false).new(),
                Cage.ofSum(21).at(5, 0).at(5, 1).at(5, 2).at(5, 3).setIsInput(false).new(),
                Cage.ofSum(22).at(3, 0).at(3, 4).at(4, 0).setIsInput(false).new(),
                Cage.ofSum(23).at(2, 0).at(3, 0).at(3, 1).at(3, 2).at(3, 3).setIsInput(false).new()
            ]
        );
    });

    test('Creation of empty instance', () => {
        expectGridAreaModel(GridAreaModel.from([]), [], []);
    });
});

export const expectGridAreaModel = (gridAreaModel: GridAreaModel, nonOverlappingCages: ReadonlyCages, overlappingCages: ReadonlyCages) => {
    const nonOverlappingCagesAreaModelCellCount = nonOverlappingCages.reduce(
        (prev, current) => prev + current.cellCount, 0);
    expect(gridAreaModel.nonOverlappingCagesAreaModel).toEqual(expect.objectContaining({
        cages: nonOverlappingCages,
        cellCount: nonOverlappingCagesAreaModelCellCount
    }));

    const nonOverlappingCagesCellIndicesCheckingSet = nonOverlappingCages.reduce(
        (prev, current) => prev.addAll(current.cellIndices), CellIndicesCheckingSet.newEmpty());
    expect(gridAreaModel.nonOverlappingCagesAreaModel.cellIndices).toEqual(nonOverlappingCagesCellIndicesCheckingSet);

    expect(gridAreaModel.overlappingCages).toEqual(overlappingCages);
};
