import * as _ from 'lodash';
import { Cage } from '../../../../src/puzzle/cage';
import { Combo, combosAndPermsForHouse } from '../../../../src/solver/math';
import { newHouseModel } from './houseModelBuilder';

describe('Performance tests for the finder of sum number combinations and sum permutations to form a HouseModel out of Cages', () => {
    const ITERATION_COUNT = 50000;

    test('Cages in descending order of combination count', () => {
        const houseM = newHouseModel([
            Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new(),
            Cage.ofSum(10).at(0, 0).at(0, 1).new(),
            Cage.ofSum(10).at(0, 2).at(1, 2).new(),
            Cage.ofSum(11).at(1, 0).at(1, 1).new()
        ]);

        expect(combosAndPermsForHouse(houseM)).toEqual([
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
        ]);

        _.range(ITERATION_COUNT).forEach(() => {
            combosAndPermsForHouse(houseM);
        });
    });

    test('Cages in ascending order of combination count', () => {
        const houseM = newHouseModel([
            Cage.ofSum(10).at(0, 0).at(0, 1).new(),
            Cage.ofSum(10).at(0, 2).at(1, 2).new(),
            Cage.ofSum(11).at(1, 0).at(1, 1).new(),
            Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new()
        ]);

        expect(combosAndPermsForHouse(houseM)).toEqual([
            [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(4, 7), Combo.of(3, 5, 6) ],
            [ Combo.of(1, 9), Combo.of(2, 8), Combo.of(5, 6), Combo.of(3, 4, 7) ],
            [ Combo.of(1, 9), Combo.of(3, 7), Combo.of(5, 6), Combo.of(2, 4, 8) ],
            [ Combo.of(1, 9), Combo.of(4, 6), Combo.of(3, 8), Combo.of(2, 5, 7) ],
            [ Combo.of(2, 8), Combo.of(1, 9), Combo.of(4, 7), Combo.of(3, 5, 6) ],
            [ Combo.of(2, 8), Combo.of(1, 9), Combo.of(5, 6), Combo.of(3, 4, 7) ],
            [ Combo.of(2, 8), Combo.of(3, 7), Combo.of(5, 6), Combo.of(1, 4, 9) ],
            [ Combo.of(3, 7), Combo.of(1, 9), Combo.of(5, 6), Combo.of(2, 4, 8) ],
            [ Combo.of(3, 7), Combo.of(2, 8), Combo.of(5, 6), Combo.of(1, 4, 9) ],
            [ Combo.of(3, 7), Combo.of(4, 6), Combo.of(2, 9), Combo.of(1, 5, 8) ],
            [ Combo.of(4, 6), Combo.of(1, 9), Combo.of(3, 8), Combo.of(2, 5, 7) ],
            [ Combo.of(4, 6), Combo.of(3, 7), Combo.of(2, 9), Combo.of(1, 5, 8) ]
        ]);

        _.range(ITERATION_COUNT).forEach(() => {
            combosAndPermsForHouse(houseM);
        });
    });
});
