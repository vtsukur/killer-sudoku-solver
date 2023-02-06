import * as _ from 'lodash';
import { Cage } from '../../../../src/puzzle/cage';
import { Combo, combosForHouse } from '../../../../src/solver/math';
import { newHouseModel } from './houseModelBuilder';

describe('Performance tests for the finder of number combinations to form a house model out of cages', () => {
    test('Many combinations of numbers to form a complete HouseModel with non-overlapping cages', () => {
        const houseM = newHouseModel([
            Cage.ofSum(10).at(0, 0).at(0, 1).new(),
            Cage.ofSum(10).at(0, 2).at(1, 2).new(),
            Cage.ofSum(11).at(1, 0).at(1, 1).new(),
            Cage.ofSum(14).at(2, 0).at(2, 1).at(2, 2).new()
        ]);

        expect(combosForHouse(houseM)).toEqual([
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

        _.range(50000).forEach(() => {
            combosForHouse(houseM);
        });
    });
});
