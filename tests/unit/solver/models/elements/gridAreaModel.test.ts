import { Cage, ReadonlyCages } from '../../../../../src/puzzle/cage';
import { CellIndicesCheckingSet } from '../../../../../src/solver/math';
import { GridAreaModel } from '../../../../../src/solver/models/elements/gridAreaModel';

describe('Unit tests for `GridAreaModel`', () => {
    test('Segmentation of `House` `Cage`s with 2 derived `Cage`s', () => {
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

    test('Segmentation of `House` `Cage`s with 2 derived `Cage`s (`Nonet` 8 from Sudoku.com 2022-10-19)', () => {
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

    test('Segmentation of `Cage`s in a big 4-`House` area with 2 derived `Cage`s and 15 unfilled `Cell`s remaining', () => {
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

    test('Segmentation of `Cage`s in a big 4-`House` area with 8 derived `Cage`s and 1 unfilled `Cell` remaining (Sudoku.com random challenge)', () => {
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

    test('Segmentation of `Cage`s in a big 4-`House` area with 5 derived `Cage`s and 13 unfilled `Cell` remaining (Sudoku.com 2022-10-22)', () => {
        const cages = [
            Cage.ofSum(19).at(0, 2).at(0, 3).at(0, 4).at(1, 2).new(),
            Cage.ofSum(22).at(2, 2).at(3, 2).at(3, 3).new(),
            Cage.ofSum(10).at(1, 3).at(2, 3).new(),
            Cage.ofSum(14).at(1, 4).at(2, 4).new(),
            Cage.ofSum(6).at(4, 3).at(5, 3).new(),
            Cage.ofSum(8).at(3, 4).at(3, 5).new(),
            Cage.ofSum(9).at(4, 4).at(4, 5).new(),
            Cage.ofSum(17).at(5, 4).at(6, 3).at(6, 4).new(),
            Cage.ofSum(6).at(5, 5).new(),
            Cage.ofSum(10).at(8, 3).at(8, 4).new(),
            Cage.ofSum(23).at(0, 3).at(0, 4).at(3, 2).at(3, 3).setIsInput(false).new(),
            Cage.ofSum(23).at(2, 2).at(3, 2).at(6, 3).at(6, 4).setIsInput(false).new(),
            Cage.ofSum(15).at(1, 3).at(1, 4).setIsInput(false).new(),
            Cage.ofSum(9).at(2, 3).at(2, 4).setIsInput(false).new(),
            Cage.ofSum(25).at(0, 2).at(0, 3).at(1, 2).at(6, 3).at(8, 3).setIsInput(false).new()
        ];

        expectGridAreaModel(GridAreaModel.from(cages, 4),
            [
                Cage.ofSum(19).at(0, 2).at(0, 3).at(0, 4).at(1, 2).new(),
                Cage.ofSum(22).at(2, 2).at(3, 2).at(3, 3).new(),
                Cage.ofSum(10).at(1, 3).at(2, 3).new(),
                Cage.ofSum(14).at(1, 4).at(2, 4).new(),
                Cage.ofSum(6).at(4, 3).at(5, 3).new(),
                Cage.ofSum(8).at(3, 4).at(3, 5).new(),
                Cage.ofSum(9).at(4, 4).at(4, 5).new(),
                Cage.ofSum(17).at(5, 4).at(6, 3).at(6, 4).new(),
                Cage.ofSum(6).at(5, 5).new(),
                Cage.ofSum(10).at(8, 3).at(8, 4).new()
            ],
            [
                Cage.ofSum(23).at(0, 3).at(0, 4).at(3, 2).at(3, 3).setIsInput(false).new(),
                Cage.ofSum(23).at(2, 2).at(3, 2).at(6, 3).at(6, 4).setIsInput(false).new(),
                Cage.ofSum(15).at(1, 3).at(1, 4).setIsInput(false).new(),
                Cage.ofSum(9).at(2, 3).at(2, 4).setIsInput(false).new(),
                Cage.ofSum(25).at(0, 2).at(0, 3).at(1, 2).at(6, 3).at(8, 3).setIsInput(false).new()
            ]
        );
    });

    test('Segmentation of no `Cage`s', () => {
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
        (prev, current) => prev.add(current.cellIndicesCheckingSet), CellIndicesCheckingSet.newEmpty());
    expect(gridAreaModel.nonOverlappingCagesAreaModel.cellIndices).toEqual(nonOverlappingCagesCellIndicesCheckingSet);

    expect(gridAreaModel.overlappingCages).toEqual(overlappingCages);
};
