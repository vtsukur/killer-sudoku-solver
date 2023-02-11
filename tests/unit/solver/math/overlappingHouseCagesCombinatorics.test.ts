import { Cage } from '../../../../src/puzzle/cage';
import { Combo } from '../../../../src/solver/math';
import { OverlappingHouseCagesCombinatorics } from '../../../../src/solver/math/overlappingHouseCagesCombinatorics';
import { HouseCagesAreaModel } from '../../../../src/solver/models/elements/houseCagesAreaModel';

describe('Unit tests for `OverlappingHouseCagesCombinatorics`', () => {
    const enumerate = OverlappingHouseCagesCombinatorics.enumerateCombos;

    test('Enumerating single `Combo` for a single overlapping `Cage`', () => {
        const combos = enumerate(new HouseCagesAreaModel([
            Cage.ofSum(4).at(1, 5).at(2, 5).new()
        ]));

        expect(combos).toEqual({
            combos: [
                [ Combo.of(1, 3) ]
            ]
        });
    });

    test('Enumerating several `Combo`s for several overlapping `Cage`s', () => {
        const combos = enumerate(new HouseCagesAreaModel([
            Cage.ofSum(5).at(1, 5).at(2, 5).new(),
            Cage.ofSum(14).at(0, 3).at(0, 4).new(),
            Cage.ofSum(9).at(1, 3).at(1, 4).new()
        ]));

        expect(combos).toEqual({
            combos: [
                [ Combo.of(1, 4), Combo.of(2, 3) ],
                [ Combo.of(5, 9), Combo.of(6, 8) ],
                [ Combo.of(1, 8), Combo.of(2, 7), Combo.of(3, 6), Combo.of(4, 5) ]
            ]
        });
    });

    test('Enumerating no `Combo`s out of no `Cage`s', () => {
        expect(enumerate(new HouseCagesAreaModel([]))).toEqual({
            combos: []
        });
    });
});
