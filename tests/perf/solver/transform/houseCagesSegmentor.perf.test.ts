import * as _ from 'lodash';
import { Cage } from '../../../../src/puzzle/cage';
import { HouseCagesSegmentor } from '../../../../src/solver/transform/houseCagesSegmentor';
import { newHouseModel } from '../../../unit/solver/math/houseModelBuilder';

describe('Performance tests for `HouseCagesSegmentor`', () => {
    const segment = HouseCagesSegmentor.segmentByCellsOverlap;

    const TESTS_COUNT = 10;
    const ITERATION_COUNT = 50000;

    _.range(TESTS_COUNT).forEach(i => {
        test(`Segmentation of \`House\` \`Cage\`s with 2 overlapping \`Cage\`s [${i + 1}]`, () => {
            const houseModel = newHouseModel([
                Cage.ofSum(7).at(0, 0).at(0, 1).new(),
                Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).new(),
                Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).new(),
                Cage.ofSum(21).at(0, 2).at(1, 0).at(1, 1).at(1, 2).new(),
                Cage.ofSum(17).at(2, 0).at(2, 1).at(2, 2).new()
            ]);

            expect(segment(houseModel.cages, houseModel.cells)).toEqual({
                nonOverlappingCages: [
                    Cage.ofSum(7).at(0, 0).at(0, 1).new(),
                    Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).new(),
                    Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).new()
                ],
                overlappingCages: [
                    Cage.ofSum(21).at(0, 2).at(1, 0).at(1, 1).at(1, 2).new(),
                    Cage.ofSum(17).at(2, 0).at(2, 1).at(2, 2).new()
                ]
            });

            _.range(ITERATION_COUNT).forEach(() => {
                segment(houseModel.cages, houseModel.cells);
            });
        });
    });
});
