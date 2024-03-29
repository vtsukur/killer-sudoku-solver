import * as _ from 'lodash';
import { Cage } from '../../../../src/puzzle/cage';
import { Combo, HouseModelCagesCombinatorics } from '../../../../src/solver/math';
import { newHouseModel } from '../../../unit/solver/math/houseModelCagesCombinatorics.test';

describe('Performance tests for `HouseModelCagesCombinatorics`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(50000);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Cages in descending order of combination count [${i}]`, () => {
            const houseM = newHouseModel([
                Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new(),
                Cage.ofSum(10).at(0, 0).at(0, 1).new(),
                Cage.ofSum(10).at(0, 2).at(1, 2).new(),
                Cage.ofSum(11).at(1, 0).at(1, 1).new()
            ]);

            expect(HouseModelCagesCombinatorics.for(houseM).sumPermsOfNonOverlappingCages).toEqual([
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

            ITERATIONS.forEach(() => {
                HouseModelCagesCombinatorics.for(houseM);
            });
        });

        test.skip(`Cages in ascending order of combination count [${i}]`, () => {
            const houseM = newHouseModel([
                Cage.ofSum(10).at(0, 0).at(0, 1).new(),
                Cage.ofSum(10).at(0, 2).at(1, 2).new(),
                Cage.ofSum(11).at(1, 0).at(1, 1).new(),
                Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new()
            ]);

            expect(HouseModelCagesCombinatorics.for(houseM).sumPermsOfNonOverlappingCages).toEqual([
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

            ITERATIONS.forEach(() => {
                HouseModelCagesCombinatorics.for(houseM);
            });
        });

    });

});
