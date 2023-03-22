import { Cage } from '../../../../src/puzzle/cage';
import { Combo, SumAddendsCombinatorics } from '../../../../src/solver/math';
import { OverlappingHouseCagesCombinatorics } from '../../../../src/solver/math/overlappingHouseCagesCombinatorics';
import { SumAddendsCombosSet } from '../../../../src/solver/sets';

describe('Unit tests for `OverlappingHouseCagesCombinatorics`', () => {

    const enumerate = OverlappingHouseCagesCombinatorics.enumerateCombos;
    const enumerateSumAddends = SumAddendsCombinatorics.enumerate;

    test('Enumerating single `Combo` for a single overlapping `Cage`', () => {
        expectOverlappingHouseCagesCombinatorics(enumerate([
            Cage.ofSum(4).at(1, 5).at(2, 5).new()
        ]), {
            combos: [
                [ Combo.of(1, 3) ]
            ],
            combosSets: [
                new SumAddendsCombosSet(enumerateSumAddends(4, 2), [ Combo.of(1, 3) ])
            ]
        });
    });

    test('Enumerating several `Combo`s for several overlapping `Cage`s', () => {
        expectOverlappingHouseCagesCombinatorics(enumerate([
            Cage.ofSum(5).at(1, 5).at(2, 5).new(),
            Cage.ofSum(14).at(0, 3).at(0, 4).new(),
            Cage.ofSum(9).at(1, 3).at(1, 4).new()
        ]), {
            combos: [
                [ Combo.of(1, 4), Combo.of(2, 3) ],
                [ Combo.of(5, 9), Combo.of(6, 8) ],
                [ Combo.of(1, 8), Combo.of(2, 7), Combo.of(3, 6), Combo.of(4, 5) ]
            ],
            combosSets: [
                new SumAddendsCombosSet(enumerateSumAddends(5, 2), [ Combo.of(1, 4), Combo.of(2, 3) ]),
                new SumAddendsCombosSet(enumerateSumAddends(14, 2), [ Combo.of(5, 9), Combo.of(6, 8) ]),
                new SumAddendsCombosSet(enumerateSumAddends(9, 2), [ Combo.of(1, 8), Combo.of(2, 7), Combo.of(3, 6), Combo.of(4, 5) ])
            ]
        });
    });

    test('Enumerating no `Combo`s out of no `Cage`s', () => {
        expectOverlappingHouseCagesCombinatorics(enumerate([]), {
            combos: [],
            combosSets: []
        });
    });

    const expectOverlappingHouseCagesCombinatorics = (
        actual: OverlappingHouseCagesCombinatorics,
        expected: OverlappingHouseCagesCombinatorics
    ) => {
        expect(actual).toEqual(expected);
    };

});
