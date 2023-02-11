import { Cage } from '../../../../src/puzzle/cage';
import { Combo } from '../../../../src/solver/math';
import { NonOverlappingHouseCagesCombinatorics } from '../../../../src/solver/math/nonOverlappingHouseCagesCombinatorics';
import { HouseCagesAreaModel } from '../../../../src/solver/models/elements/houseCagesAreaModel';

describe('Unit tests for `NonOverlappingHouseCagesCombinatorics`', () => {
    const compute = NonOverlappingHouseCagesCombinatorics.computeCombosAndPerms;

    test('Computing several `Combo`s and `Perm`s forming a complete `HouseModel`', () => {
        const combosAndPerms = compute(new HouseCagesAreaModel([
            Cage.ofSum(15).at(1, 1).at(1, 2).new(),
            Cage.ofSum(10).at(1, 3).at(2, 3).new(),
            Cage.ofSum(7).at(2, 1).at(2, 2).new(),
            Cage.ofSum(13).at(3, 1).at(3, 2).at(3, 3).new()
        ]));

        expect(combosAndPerms).toEqual({
            perms: [
                [ Combo.of(6, 9), Combo.of(2, 8), Combo.of(3, 4), Combo.of(1, 5, 7) ],
                [ Combo.of(6, 9), Combo.of(3, 7), Combo.of(2, 5), Combo.of(1, 4, 8) ],
                [ Combo.of(7, 8), Combo.of(1, 9), Combo.of(2, 5), Combo.of(3, 4, 6) ],
                [ Combo.of(7, 8), Combo.of(1, 9), Combo.of(3, 4), Combo.of(2, 5, 6) ],
                [ Combo.of(7, 8), Combo.of(4, 6), Combo.of(2, 5), Combo.of(1, 3, 9) ]
            ],
            combos: [
                [ Combo.of(6, 9), Combo.of(7, 8) ],
                [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ],
                [ Combo.of(2, 5), Combo.of(3, 4) ],
                [ Combo.of(1, 3, 9), Combo.of(1, 4, 8), Combo.of(1, 5, 7), Combo.of(2, 5, 6), Combo.of(3, 4, 6) ]
            ]
        });
    });

    test('Computing many `Combo`s and `Perm`s forming a complete `HouseModel`', () => {
        const combosAndPerms = compute(new HouseCagesAreaModel([
            Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new(),
            Cage.ofSum(10).at(0, 0).at(0, 1).new(),
            Cage.ofSum(10).at(0, 2).at(1, 2).new(),
            Cage.ofSum(11).at(1, 0).at(1, 1).new()
        ]));

        expect(combosAndPerms).toEqual({
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
            ],
            combos: [
                [ Combo.of(1, 4, 9), Combo.of(1, 5, 8), Combo.of(2, 4, 8), Combo.of(2, 5, 7), Combo.of(3, 4, 7), Combo.of(3, 5, 6) ],
                [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ],
                [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6) ],
                [ Combo.of(2, 9), Combo.of(3, 8), Combo.of(4, 7), Combo.of(5, 6) ]
            ]
        });
    });

    test('Computing several `Combo`s and single `Perm` forming a complete `HouseModel`', () => {
        const combosAndPerms = compute(new HouseCagesAreaModel([
            Cage.ofSum(4).at(1, 1).at(1, 2).new(),
            Cage.ofSum(24).at(1, 3).at(1, 4).at(1, 5).new(),
            Cage.ofSum(7).at(1, 6).at(1, 7).new(),
            Cage.ofSum(4).at(1, 8).new()
        ]));

        expect(combosAndPerms).toEqual({
            perms: [
                [ Combo.of(1, 3), Combo.of(7, 8, 9), Combo.of(2, 5), Combo.of(4) ]
            ],
            combos: [
                [ Combo.of(1, 3) ],
                [ Combo.of(7, 8, 9) ],
                [ Combo.of(2, 5) ],
                [ Combo.of(4) ]
            ]
        });
    });

    test('Computing few `Combo`s and `Perm`s forming an incomplete `HouseModel`', () => {
        const combosAndPerms = compute(new HouseCagesAreaModel([
            Cage.ofSum(5).at(0, 0).at(0, 1).new(),
            Cage.ofSum(7).at(0, 2).at(1, 2).new()
        ]));

        expect(combosAndPerms).toEqual({
            perms: [
                [ Combo.of(1, 4), Combo.of(2, 5) ],
                [ Combo.of(2, 3), Combo.of(1, 6) ]
            ],
            combos: [
                [ Combo.of(1, 4), Combo.of(2, 3) ],
                [ Combo.of(1, 6), Combo.of(2, 5) ]
            ]
        });
    });

    test('Computing several `Combo`s and `Perm`s forming an incomplete `HouseModel` forming an incomplete HouseModel with a single `Cage`', () => {
        const combosAndPerms = compute(new HouseCagesAreaModel([
            Cage.ofSum(5).at(1, 1).at(1, 2).new()
        ]));

        expect(combosAndPerms).toEqual({
            perms: [
                [ Combo.of(1, 4) ],
                [ Combo.of(2, 3) ]
            ],
            combos: [
                [ Combo.of(1, 4), Combo.of(2, 3) ]
            ]
        });
    });

    test('Computing several `Combo`s and `Perm`s forming a `HouseModel` out of no `Cage`s', () => {
        expect(compute(new HouseCagesAreaModel([]))).toEqual({
            perms: [],
            combos: []
        });
    });
});
