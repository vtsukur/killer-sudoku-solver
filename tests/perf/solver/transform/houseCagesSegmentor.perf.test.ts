import * as _ from 'lodash';
import { Cage } from '../../../../src/puzzle/cage';
import { HouseCagesSegmentor } from '../../../../src/solver/transform/houseCagesSegmentor';
import { newHouseModel } from '../../../unit/solver/math/houseModelBuilder';

describe('Performance tests for `HouseCagesSegmentor`', () => {
    const segment = HouseCagesSegmentor.segmentByCellsOverlap;

    const TESTS_COUNT = 10;
    const ITERATION_COUNT = 50000;

    _.range(TESTS_COUNT).forEach(i => {
        test(`Segmentation of \`House\` \`Cage\`s with 2 overlapping \`Cage\`s (\`Nonet\` 8 from Sudoku.com 2022-10-19) [${i + 1}]`, () => {
            const houseModel = newHouseModel([
                Cage.ofSum(9).at(7, 8).at(8, 8).new(),
                Cage.ofSum(11).at(8, 7).at(8, 8).setIsInput(false).new(),
                Cage.ofSum(15).at(7, 7).at(8, 7).new(),
                Cage.ofSum(13).at(6, 6).at(7, 6).at(8, 6).setIsInput(false).new(),
                Cage.ofSum(13).at(7, 7).at(7, 8).setIsInput(false).new(),
                Cage.ofSum(8).at(6, 7).at(6, 8).setIsInput(false).new()
            ]);

            expect(segment(houseModel.cages, houseModel.cells)).toEqual({
                nonOverlappingCages: [
                    Cage.ofSum(9).at(7, 8).at(8, 8).new(),
                    Cage.ofSum(15).at(7, 7).at(8, 7).new(),
                    Cage.ofSum(13).at(6, 6).at(7, 6).at(8, 6).setIsInput(false).new(),
                    Cage.ofSum(8).at(6, 7).at(6, 8).setIsInput(false).new()
                ],
                overlappingCages: [
                    Cage.ofSum(11).at(8, 7).at(8, 8).setIsInput(false).new(),
                    Cage.ofSum(13).at(7, 7).at(7, 8).setIsInput(false).new()
                ]
            });

            _.range(ITERATION_COUNT).forEach(() => {
                segment(houseModel.cages, houseModel.cells);
            });
        });

        test.only(`Segmentation of \`Cage\`s in a big 4-\`House\` area with 2 derived \`Cage\`s and 15 unfilled \`Cell\`s remaining [${i + 1}]`, () => {
            const houseModel = newHouseModel([
                Cage.ofSum(12).at(2, 3).at(3, 2).at(3, 3).new(),
                Cage.ofSum(14).at(2, 4).at(2, 5).at(2, 6).at(3, 4).new(),
                Cage.ofSum(5).at(5, 0).at(5, 1).new(),
                Cage.ofSum(24).at(4, 4).at(4, 5).at(5, 4).new(),
                Cage.ofSum(7).at(3, 5).at(3, 6).new(),
                Cage.ofSum(12).at(4, 6).at(4, 7).at(4, 8).new(),
                Cage.ofSum(20).at(2, 6).at(3, 2).at(3, 3).at(3, 4).setIsInput(false).new(),
                Cage.ofSum(20).at(2, 4).at(2, 5).at(3, 4).at(3, 7).at(3, 8).setIsInput(false).new(),
                Cage.ofSum(12).at(3, 0).at(3, 1).new(),
                Cage.ofSum(10).at(4, 0).at(4, 1).new()
            ]);

            expect(segment(houseModel.cages, houseModel.cells, 36)).toEqual({
                nonOverlappingCages: [
                    Cage.ofSum(12).at(2, 3).at(3, 2).at(3, 3).new(),
                    Cage.ofSum(14).at(2, 4).at(2, 5).at(2, 6).at(3, 4).new(),
                    Cage.ofSum(5).at(5, 0).at(5, 1).new(),
                    Cage.ofSum(24).at(4, 4).at(4, 5).at(5, 4).new(),
                    Cage.ofSum(7).at(3, 5).at(3, 6).new(),
                    Cage.ofSum(12).at(4, 6).at(4, 7).at(4, 8).new(),
                    Cage.ofSum(12).at(3, 0).at(3, 1).new(),
                    Cage.ofSum(10).at(4, 0).at(4, 1).new()
                ],
                overlappingCages: [
                    Cage.ofSum(20).at(2, 6).at(3, 2).at(3, 3).at(3, 4).setIsInput(false).new(),
                    Cage.ofSum(20).at(2, 4).at(2, 5).at(3, 4).at(3, 7).at(3, 8).setIsInput(false).new()
                ]
            });

            _.range(ITERATION_COUNT).forEach(() => {
                segment(houseModel.cages, houseModel.cells, 36);
            });
        });

        test(`Segmentation of \`Cage\`s in a big 4-\`House\` area with 8 derived \`Cage\`s and 1 unfilled \`Cell\` remaining (Sudoku.com random challenge) [${i + 1}]`, () => {
            const houseModel = newHouseModel([
                Cage.ofSum(6).at(0, 5).at(0, 6).new(),
                Cage.ofSum(18).at(1, 5).at(1, 6).at(2, 5).at(2, 6).new(),
                Cage.ofSum(16).at(0, 7).at(0, 8).new(),
                Cage.ofSum(9).at(1, 7).at(2, 7).new(),
                Cage.ofSum(10).at(1, 8).at(2, 8).new(),
                Cage.ofSum(4).at(3, 5).at(3, 6).new(),
                Cage.ofSum(21).at(5, 5).at(5, 6).at(6, 5).new(),
                Cage.ofSum(9).at(3, 7).at(3, 8).new(),
                Cage.ofSum(15).at(4, 6).at(4, 7).at(4, 8).new(),
                Cage.ofSum(13).at(5, 7).at(5, 8).at(6, 8).new(),
                Cage.ofSum(11).at(7, 5).at(7, 6).new(),
                Cage.ofSum(5).at(8, 5).at(8, 6).new(),
                Cage.ofSum(10).at(6, 6).at(6, 7).new(),
                Cage.ofSum(13).at(7, 7).at(8, 7).new(),
                Cage.ofSum(11).at(7, 8).at(8, 8).new(),
                Cage.ofSum(14).at(0, 5).at(1, 5).at(2, 5).setIsInput(false).new(),
                Cage.ofSum(18).at(5, 7).at(5, 8).at(7, 5).at(8, 5).setIsInput(false).new(),
                Cage.ofSum(18).at(3, 6).at(5, 6).at(6, 5).setIsInput(false).new(),
                Cage.ofSum(24).at(5, 5).at(5, 6).at(5, 7).at(5, 8).setIsInput(false).new(),
                Cage.ofSum(15).at(7, 7).at(7, 8).setIsInput(false).new(),
                Cage.ofSum(10).at(6, 5).at(6, 8).setIsInput(false).new(),
                Cage.ofSum(7).at(3, 5).at(5, 5).setIsInput(false).new(),
                Cage.ofSum(9).at(8, 7).at(8, 8).setIsInput(false).new()
            ]);

            expect(segment(houseModel.cages, houseModel.cells, 36)).toEqual({
                nonOverlappingCages: [
                    Cage.ofSum(6).at(0, 5).at(0, 6).new(),
                    Cage.ofSum(18).at(1, 5).at(1, 6).at(2, 5).at(2, 6).new(),
                    Cage.ofSum(16).at(0, 7).at(0, 8).new(),
                    Cage.ofSum(9).at(1, 7).at(2, 7).new(),
                    Cage.ofSum(10).at(1, 8).at(2, 8).new(),
                    Cage.ofSum(4).at(3, 5).at(3, 6).new(),
                    Cage.ofSum(21).at(5, 5).at(5, 6).at(6, 5).new(),
                    Cage.ofSum(9).at(3, 7).at(3, 8).new(),
                    Cage.ofSum(15).at(4, 6).at(4, 7).at(4, 8).new(),
                    Cage.ofSum(13).at(5, 7).at(5, 8).at(6, 8).new(),
                    Cage.ofSum(11).at(7, 5).at(7, 6).new(),
                    Cage.ofSum(5).at(8, 5).at(8, 6).new(),
                    Cage.ofSum(10).at(6, 6).at(6, 7).new(),
                    Cage.ofSum(13).at(7, 7).at(8, 7).new(),
                    Cage.ofSum(11).at(7, 8).at(8, 8).new()
                ],
                overlappingCages: [
                    Cage.ofSum(14).at(0, 5).at(1, 5).at(2, 5).setIsInput(false).new(),
                    Cage.ofSum(18).at(5, 7).at(5, 8).at(7, 5).at(8, 5).setIsInput(false).new(),
                    Cage.ofSum(18).at(3, 6).at(5, 6).at(6, 5).setIsInput(false).new(),
                    Cage.ofSum(24).at(5, 5).at(5, 6).at(5, 7).at(5, 8).setIsInput(false).new(),
                    Cage.ofSum(15).at(7, 7).at(7, 8).setIsInput(false).new(),
                    Cage.ofSum(10).at(6, 5).at(6, 8).setIsInput(false).new(),
                    Cage.ofSum(7).at(3, 5).at(5, 5).setIsInput(false).new(),
                    Cage.ofSum(9).at(8, 7).at(8, 8).setIsInput(false).new()
                ]
            });

            _.range(ITERATION_COUNT).forEach(() => {
                segment(houseModel.cages, houseModel.cells, 36);
            });
        });
    });
});
