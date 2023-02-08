import { Cage } from '../../../../src/puzzle/cage';
import { Combo, combosAndPermsForHouse } from '../../../../src/solver/math';
import { newHouseModel } from './houseModelBuilder';

describe('Tests for the finder of sum number combinations and sum permutations forming a HouseModel out of Cages', () => {
    test('Several combinations and permutations forming a complete HouseModel with non-overlapping Cages', () => {
        const combosAndPerms = combosAndPermsForHouse(newHouseModel([
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
            sumPermsForNonOverlappingCages: [
                [ Combo.of(6, 9), Combo.of(2, 8), Combo.of(3, 4), Combo.of(1, 5, 7) ],
                [ Combo.of(6, 9), Combo.of(3, 7), Combo.of(2, 5), Combo.of(1, 4, 8) ],
                [ Combo.of(7, 8), Combo.of(1, 9), Combo.of(2, 5), Combo.of(3, 4, 6) ],
                [ Combo.of(7, 8), Combo.of(1, 9), Combo.of(3, 4), Combo.of(2, 5, 6) ],
                [ Combo.of(7, 8), Combo.of(4, 6), Combo.of(2, 5), Combo.of(1, 3, 9) ]
            ],
            actualSumCombos: [
                [ Combo.of(6, 9), Combo.of(7, 8) ],
                [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ],
                [ Combo.of(2, 5), Combo.of(3, 4) ],
                [ Combo.of(1, 3, 9), Combo.of(1, 4, 8), Combo.of(1, 5, 7), Combo.of(2, 5, 6), Combo.of(3, 4, 6) ]
            ]
        });
    });

    test('Many combinations and permutations forming a complete HouseModel with non-overlapping Cages', () => {
        const combosAndPerms = combosAndPermsForHouse(newHouseModel([
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
            sumPermsForNonOverlappingCages: [
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
            actualSumCombos: [
                [ Combo.of(1, 4, 9), Combo.of(1, 5, 8), Combo.of(2, 4, 8), Combo.of(2, 5, 7), Combo.of(3, 4, 7), Combo.of(3, 5, 6) ],
                [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ],
                [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ],
                [ Combo.of(2, 9), Combo.of(3, 8), Combo.of(4, 7), Combo.of(5, 6) ]
            ]
        });
    });

    test('Few combinations and permutations forming an incomplete HouseModel with non-overlapping Cages', () => {
        const combosAndPerms = combosAndPermsForHouse(newHouseModel([
            Cage.ofSum(5).at(0, 0).at(0, 1).new(),
            Cage.ofSum(7).at(0, 2).at(1, 2).new()
        ]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [
                Cage.ofSum(5).at(0, 0).at(0, 1).new(),
                Cage.ofSum(7).at(0, 2).at(1, 2).new()
            ],
            sumPermsForNonOverlappingCages: [
                [ Combo.of(1, 4), Combo.of(2, 5) ],
                [ Combo.of(2, 3), Combo.of(1, 6) ]
            ],
            actualSumCombos: [
                [ Combo.of(1, 4), Combo.of(2, 3) ],
                [ Combo.of(1, 6), Combo.of(2, 5) ]
            ]
        });
    });

    test('Several combinations and single permutation forming a complete HouseModel with non-overlapping Cages', () => {
        const combosAndPerms = combosAndPermsForHouse(newHouseModel([
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
            sumPermsForNonOverlappingCages: [
                [ Combo.of(1, 3), Combo.of(7, 8, 9), Combo.of(2, 5), Combo.of(4) ]
            ],
            actualSumCombos: [
                [ Combo.of(1, 3) ],
                [ Combo.of(7, 8, 9) ],
                [ Combo.of(2, 5) ],
                [ Combo.of(4) ]
            ]
        });
    });

    test('Combinations and permutations forming a HouseModel with overlapping Cages', () => {
        const combosAndPerms = combosAndPermsForHouse(newHouseModel([
            Cage.ofSum(8).at(2, 5).at(3, 5).new(),
            Cage.ofSum(8).at(7, 5).new(),
            // overlapping cage
            Cage.ofSum(4).at(1, 5).at(2, 5).new(),
            Cage.ofSum(29).at(0, 5).at(1, 5).at(4, 5).at(5, 5).at(6, 5).at(8, 5).new()
        ]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [
                Cage.ofSum(8).at(2, 5).at(3, 5).new(),
                Cage.ofSum(8).at(7, 5).new(),
                Cage.ofSum(29).at(0, 5).at(1, 5).at(4, 5).at(5, 5).at(6, 5).at(8, 5).new()
            ],
            sumPermsForNonOverlappingCages: [
                [ Combo.of(1, 7), Combo.of(8), Combo.of(2, 3, 4, 5, 6, 9) ],
                [ Combo.of(2, 6), Combo.of(8), Combo.of(1, 3, 4, 5, 7, 9) ],
                [ Combo.of(3, 5), Combo.of(8), Combo.of(1, 2, 4, 6, 7, 9) ]
            ],
            actualSumCombos: [
                [ Combo.of(1, 7), Combo.of(2, 6), Combo.of(3, 5) ],
                [ Combo.of(8) ],
                [ Combo.of(1, 3) ],
                [ Combo.of(1, 2, 4, 6, 7, 9), Combo.of(1, 3, 4, 5, 7, 9), Combo.of(2, 3, 4, 5, 6, 9) ]
            ]
        });
    });

    test('Combinations and permutations forming a HouseModel out of no Cages', () => {
        const combosAndPerms = combosAndPermsForHouse(newHouseModel([]));

        expect(combosAndPerms).toEqual({
            nonOverlappingCages: [],
            sumPermsForNonOverlappingCages: [],
            actualSumCombos: []
        });
    });
});
