import { Cage } from '../../../../src/puzzle/cage';
import { Combo, SumCombinatorics } from '../../../../src/solver/math';
import { NonOverlappingHouseCagesCombinatorics } from '../../../../src/solver/math/nonOverlappingHouseCagesCombinatorics';
import { GridAreaModel } from '../../../../src/solver/models/elements/gridAreaModel';
import { CombosSet } from '../../../../src/solver/sets';

describe('Unit tests for `NonOverlappingHouseCagesCombinatorics`', () => {

    const enumerate = NonOverlappingHouseCagesCombinatorics.enumerateCombosAndPerms;

    test('Enumerating several `Combo`s and `Perm`s forming a complete `HouseModel`', () => {
        expectNonOverlappingHouseCagesCombinatorics(enumerate(GridAreaModel.from([
            Cage.ofSum(15).at(1, 1).at(1, 2).new(),
            Cage.ofSum(10).at(1, 3).at(2, 3).new(),
            Cage.ofSum(7).at(2, 1).at(2, 2).new(),
            Cage.ofSum(13).at(3, 1).at(3, 2).at(3, 3).new()
        ]).nonOverlappingCagesAreaModel), {
            combosSets: [
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][15], [ Combo.of(6, 9), Combo.of(7, 8) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][10], [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][7], [ Combo.of(2, 5), Combo.of(3, 4) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[3][13], [ Combo.of(1, 3, 9), Combo.of(1, 4, 8), Combo.of(1, 5, 7), Combo.of(2, 5, 6), Combo.of(3, 4, 6) ])
            ],
            perms: [
                [ Combo.of(6, 9), Combo.of(2, 8), Combo.of(3, 4), Combo.of(1, 5, 7) ],
                [ Combo.of(6, 9), Combo.of(3, 7), Combo.of(2, 5), Combo.of(1, 4, 8) ],
                [ Combo.of(7, 8), Combo.of(1, 9), Combo.of(2, 5), Combo.of(3, 4, 6) ],
                [ Combo.of(7, 8), Combo.of(1, 9), Combo.of(3, 4), Combo.of(2, 5, 6) ],
                [ Combo.of(7, 8), Combo.of(4, 6), Combo.of(2, 5), Combo.of(1, 3, 9) ]
            ]
        });
    });

    test('Enumerating many `Combo`s and `Perm`s forming a complete `HouseModel`', () => {
        expectNonOverlappingHouseCagesCombinatorics(enumerate(GridAreaModel.from([
            Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new(),
            Cage.ofSum(10).at(0, 0).at(0, 1).new(),
            Cage.ofSum(10).at(0, 2).at(1, 2).new(),
            Cage.ofSum(11).at(1, 0).at(1, 1).new()
        ]).nonOverlappingCagesAreaModel), {
            combosSets: [
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[3][14], [ Combo.of(1, 4, 9), Combo.of(1, 5, 8), Combo.of(2, 4, 8), Combo.of(2, 5, 7), Combo.of(3, 4, 7), Combo.of(3, 5, 6) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][10], [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][10], [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][11], [ Combo.of(2, 9), Combo.of(3, 8), Combo.of(4, 7), Combo.of(5, 6) ])
            ],
            perms: [
                [ Combo.of(1, 4, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(5, 6) ],
                [ Combo.of(1, 4, 9), Combo.of(3, 7), Combo.of(2, 8), Combo.of(5, 6) ],
                [ Combo.of(1, 5, 8), Combo.of(3, 7), Combo.of(4, 6), Combo.of(2, 9) ],
                [ Combo.of(1, 5, 8), Combo.of(4, 6), Combo.of(3, 7), Combo.of(2, 9) ],
                [ Combo.of(2, 4, 8), Combo.of(1, 9), Combo.of(3, 7), Combo.of(5, 6) ],
                [ Combo.of(2, 4, 8), Combo.of(3, 7), Combo.of(1, 9), Combo.of(5, 6) ],
                [ Combo.of(2, 5, 7), Combo.of(1, 9), Combo.of(4, 6), Combo.of(3, 8) ],
                [ Combo.of(2, 5, 7), Combo.of(4, 6), Combo.of(1, 9), Combo.of(3, 8) ],
                [ Combo.of(3, 4, 7), Combo.of(1, 9), Combo.of(2, 8), Combo.of(5, 6) ],
                [ Combo.of(3, 4, 7), Combo.of(2, 8), Combo.of(1, 9), Combo.of(5, 6) ],
                [ Combo.of(3, 5, 6), Combo.of(1, 9), Combo.of(2, 8), Combo.of(4, 7) ],
                [ Combo.of(3, 5, 6), Combo.of(2, 8), Combo.of(1, 9), Combo.of(4, 7) ]
            ]
        });
    });

    test('Enumerating several `Combo`s and single `Perm` forming a complete `HouseModel`', () => {
        expectNonOverlappingHouseCagesCombinatorics(enumerate(GridAreaModel.from([
            Cage.ofSum(4).at(1, 1).at(1, 2).new(),
            Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).new(),
            Cage.ofSum(7).at(1, 6).at(1, 7).new(),
            Cage.ofSum(4).at(1, 8).new()
        ]).nonOverlappingCagesAreaModel), {
            combosSets: [
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][4], [ Combo.of(1, 3) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[3][24], [ Combo.of(7, 8, 9) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][7], [ Combo.of(2, 5) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[1][4], [ Combo.ofNum(4) ])
            ],
            perms: [
                [ Combo.of(1, 3), Combo.of(7, 8, 9), Combo.of(2, 5), Combo.ofNum(4) ]
            ]
        });
    });

    test('Enumerating few `Combo`s and `Perm`s forming an incomplete `HouseModel`', () => {
        expectNonOverlappingHouseCagesCombinatorics(enumerate(GridAreaModel.from([
            Cage.ofSum(5).at(0, 0).at(0, 1).new(),
            Cage.ofSum(7).at(0, 2).at(1, 2).new()
        ]).nonOverlappingCagesAreaModel), {
            combosSets: [
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][5], [ Combo.of(1, 4), Combo.of(2, 3) ]),
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][7], [ Combo.of(1, 6), Combo.of(2, 5) ])
            ],
            perms: [
                [ Combo.of(1, 4), Combo.of(2, 5) ],
                [ Combo.of(2, 3), Combo.of(1, 6) ]
            ]
        });
    });

    test('Enumerating several `Combo`s and `Perm`s forming an incomplete `HouseModel` forming an incomplete HouseModel with a single `Cage`', () => {
        expectNonOverlappingHouseCagesCombinatorics(enumerate(GridAreaModel.from([
            Cage.ofSum(5).at(1, 1).at(1, 2).new()
        ]).nonOverlappingCagesAreaModel), {
            combosSets: [
                CombosSet.from(SumCombinatorics.BY_COUNT_BY_SUM[2][5], [ Combo.of(1, 4), Combo.of(2, 3) ])
            ],
            perms: [
                [ Combo.of(1, 4) ],
                [ Combo.of(2, 3) ]
            ]
        });
    });

    test('Enumerating no `Combo`s and `Perm`s forming a `HouseModel` out of no `Cage`s', () => {
        expectNonOverlappingHouseCagesCombinatorics(enumerate(GridAreaModel.from([]).nonOverlappingCagesAreaModel), {
            combosSets: [],
            perms: []
        });
    });

    const expectNonOverlappingHouseCagesCombinatorics = (
        actual: NonOverlappingHouseCagesCombinatorics,
        expected: NonOverlappingHouseCagesCombinatorics
    ) => {
        expect(actual).toEqual(expected);
    };
});
