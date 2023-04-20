import { Cage, ReadonlyCages } from '../../../../src/puzzle/cage';
import { Cell, CellKey } from '../../../../src/puzzle/cell';
import { Combo, HouseModelCagesCombinatorics, SumCombos } from '../../../../src/solver/math';
import { CageModel } from '../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../src/solver/models/elements/cellModel';
import { HouseModel } from '../../../../src/solver/models/elements/houseModel';
import { CombosSet } from '../../../../src/solver/sets';

describe('Unit tests for `HouseModelCagesCombinatorics`', () => {

    const enumerateSumCombos = SumCombos.enumerate;

    test('Several combinations and permutations forming a complete HouseModel with non-overlapping Cages', () => {
        const combosAndPerms = HouseModelCagesCombinatorics.for(newHouseModel([
            Cage.ofSum(15).at(1, 1).at(1, 2).new(),
            Cage.ofSum(10).at(1, 3).at(2, 3).new(),
            Cage.ofSum(7).at(2, 1).at(2, 2).new(),
            Cage.ofSum(13).at(3, 1).at(3, 2).at(3, 3).new()
        ]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [
                Cage.ofSum(15).at(1, 1).at(1, 2).new(),
                Cage.ofSum(10).at(1, 3).at(2, 3).new(),
                Cage.ofSum(7).at(2, 1).at(2, 2).new(),
                Cage.ofSum(13).at(3, 1).at(3, 2).at(3, 3).new()
            ],
            sumPermsOfNonOverlappingCages: [
                [ Combo.of(6, 9), Combo.of(2, 8), Combo.of(3, 4), Combo.of(1, 5, 7) ],
                [ Combo.of(6, 9), Combo.of(3, 7), Combo.of(2, 5), Combo.of(1, 4, 8) ],
                [ Combo.of(7, 8), Combo.of(1, 9), Combo.of(2, 5), Combo.of(3, 4, 6) ],
                [ Combo.of(7, 8), Combo.of(1, 9), Combo.of(3, 4), Combo.of(2, 5, 6) ],
                [ Combo.of(7, 8), Combo.of(4, 6), Combo.of(2, 5), Combo.of(1, 3, 9) ]
            ],
            actualSumCombosOfAllCages: [
                CombosSet.from(enumerateSumCombos(15, 2), [ Combo.of(6, 9), Combo.of(7, 8) ]),
                CombosSet.from(enumerateSumCombos(10, 2), [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ]),
                CombosSet.from(enumerateSumCombos(7, 2), [ Combo.of(2, 5), Combo.of(3, 4) ]),
                CombosSet.from(enumerateSumCombos(13, 3), [ Combo.of(1, 3, 9), Combo.of(1, 4, 8), Combo.of(1, 5, 7), Combo.of(2, 5, 6), Combo.of(3, 4, 6) ])
            ]
        } as HouseModelCagesCombinatorics);
    });

    test('Many combinations and permutations forming a complete HouseModel with non-overlapping Cages', () => {
        const combosAndPerms = HouseModelCagesCombinatorics.for(newHouseModel([
            Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new(),
            Cage.ofSum(10).at(0, 0).at(0, 1).new(),
            Cage.ofSum(10).at(0, 2).at(1, 2).new(),
            Cage.ofSum(11).at(1, 0).at(1, 1).new()
        ]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [
                Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new(),
                Cage.ofSum(10).at(0, 0).at(0, 1).new(),
                Cage.ofSum(10).at(0, 2).at(1, 2).new(),
                Cage.ofSum(11).at(1, 0).at(1, 1).new()
            ],
            sumPermsOfNonOverlappingCages: [
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
            ],
            actualSumCombosOfAllCages: [
                CombosSet.from(enumerateSumCombos(14, 3), [ Combo.of(1, 4, 9), Combo.of(1, 5, 8), Combo.of(2, 4, 8), Combo.of(2, 5, 7), Combo.of(3, 4, 7), Combo.of(3, 5, 6) ]),
                CombosSet.from(enumerateSumCombos(10, 2), [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ]),
                CombosSet.from(enumerateSumCombos(10, 2), [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ]),
                CombosSet.from(enumerateSumCombos(11, 2), [ Combo.of(2, 9), Combo.of(3, 8), Combo.of(4, 7), Combo.of(5, 6) ])
            ]
        } as HouseModelCagesCombinatorics);
    });

    test('Few combinations and permutations forming an incomplete HouseModel with non-overlapping Cages', () => {
        const combosAndPerms = HouseModelCagesCombinatorics.for(newHouseModel([
            Cage.ofSum(5).at(0, 0).at(0, 1).new(),
            Cage.ofSum(7).at(0, 2).at(1, 2).new()
        ]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [
                Cage.ofSum(5).at(0, 0).at(0, 1).new(),
                Cage.ofSum(7).at(0, 2).at(1, 2).new()
            ],
            sumPermsOfNonOverlappingCages: [
                [ Combo.of(1, 4), Combo.of(2, 5) ],
                [ Combo.of(2, 3), Combo.of(1, 6) ]
            ],
            actualSumCombosOfAllCages: [
                CombosSet.from(enumerateSumCombos(5, 2), [ Combo.of(1, 4), Combo.of(2, 3) ]),
                CombosSet.from(enumerateSumCombos(7, 2), [ Combo.of(1, 6), Combo.of(2, 5) ])
            ]
        } as HouseModelCagesCombinatorics);
    });

    test('Several combinations and single permutation forming a complete HouseModel with non-overlapping Cages', () => {
        const combosAndPerms = HouseModelCagesCombinatorics.for(newHouseModel([
            Cage.ofSum(4).at(1, 1).at(1, 2).new(),
            Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).new(),
            Cage.ofSum(7).at(1, 6).at(1, 7).new(),
            Cage.ofSum(4).at(1, 8).new()
        ]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [
                Cage.ofSum(4).at(1, 1).at(1, 2).new(),
                Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).new(),
                Cage.ofSum(7).at(1, 6).at(1, 7).new(),
                Cage.ofSum(4).at(1, 8).new()
            ],
            sumPermsOfNonOverlappingCages: [
                [ Combo.of(1, 3), Combo.of(7, 8, 9), Combo.of(2, 5), Combo.of(4) ]
            ],
            actualSumCombosOfAllCages: [
                CombosSet.from(enumerateSumCombos(4, 2), [ Combo.of(1, 3) ]),
                CombosSet.from(enumerateSumCombos(24, 3), [ Combo.of(7, 8, 9) ]),
                CombosSet.from(enumerateSumCombos(7, 2), [ Combo.of(2, 5) ]),
                CombosSet.from(enumerateSumCombos(4, 1), [ Combo.of(4) ])
            ]
        } as HouseModelCagesCombinatorics);
    });

    test('Combinations and permutations forming a HouseModel with overlapping Cages', () => {
        const combosAndPerms = HouseModelCagesCombinatorics.for(newHouseModel([
            Cage.ofSum(8).at(2, 5).at(3, 5).new(),
            Cage.ofSum(8).at(7, 5).new(),
            Cage.ofSum(4).at(1, 5).at(2, 5).setIsInput(false).new(),
            Cage.ofSum(29).at(0, 5).at(1, 5).at(4, 5).at(5, 5).at(6, 5).at(8, 5).new()
        ]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [
                Cage.ofSum(8).at(2, 5).at(3, 5).new(),
                Cage.ofSum(8).at(7, 5).new(),
                Cage.ofSum(29).at(0, 5).at(1, 5).at(4, 5).at(5, 5).at(6, 5).at(8, 5).new()
            ],
            sumPermsOfNonOverlappingCages: [
                [ Combo.of(1, 7), Combo.of(8), Combo.of(2, 3, 4, 5, 6, 9) ],
                [ Combo.of(2, 6), Combo.of(8), Combo.of(1, 3, 4, 5, 7, 9) ],
                [ Combo.of(3, 5), Combo.of(8), Combo.of(1, 2, 4, 6, 7, 9) ]
            ],
            actualSumCombosOfAllCages: [
                CombosSet.from(enumerateSumCombos(8, 2), [ Combo.of(1, 7), Combo.of(2, 6), Combo.of(3, 5) ]),
                CombosSet.from(enumerateSumCombos(8, 1), [ Combo.of(8) ]),
                CombosSet.from(enumerateSumCombos(4, 2), [ Combo.of(1, 3) ]),
                CombosSet.from(enumerateSumCombos(29, 6), [ Combo.of(1, 2, 4, 6, 7, 9), Combo.of(1, 3, 4, 5, 7, 9), Combo.of(2, 3, 4, 5, 6, 9) ])
            ]
        } as HouseModelCagesCombinatorics);
    });

    test('Combinations and permutations forming a HouseModel out of no Cages', () => {
        const combosAndPerms = HouseModelCagesCombinatorics.for(newHouseModel([]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [],
            sumPermsOfNonOverlappingCages: [],
            actualSumCombosOfAllCages: []
        } as HouseModelCagesCombinatorics);
    });
});

export const newHouseModel = (cages: ReadonlyCages) => {
    const cellsMap: Map<CellKey, Cell> = new Map();
    cages.forEach(cage => {
        cage.cells.forEach(cell => {
            cellsMap.set(cell.key, cell);
        });
    });
    const cageMs = cages.map(cage => new CageModel(cage, cage.cells.map(cell => new CellModel(cell))));
    const houseM = new HouseModel(0, Array.from(cellsMap.values()));
    for (const cageM of cageMs) {
        houseM.addCageModel(cageM);
    }
    return houseM;
};
