import * as _ from 'lodash';
import { Cage } from '../../../../../src/puzzle/cage';
import { GridAreaModel } from '../../../../../src/solver/models/elements/gridAreaModel';
import { newHouseModel } from '../../../../unit/solver/math/houseModelBuilder';

describe('Performance tests for `GridAreaModel`', () => {
    const segment = GridAreaModel.segmentByCellsOverlap;

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

            expect(segment(houseModel.cages)).toEqual({
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
                segment(houseModel.cages);
            });
        });

        test(`Segmentation of \`Cage\`s in a big 4-\`House\` area with 2 derived \`Cage\`s and 15 unfilled \`Cell\`s remaining [${i + 1}]`, () => {
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

            expect(segment(houseModel.cages, 4)).toEqual({
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
                segment(houseModel.cages, 4);
            });
        });

        test.only(`Segmentation of \`Cage\`s in a big 4-\`House\` area with 5 derived \`Cage\`s and 13 unfilled \`Cell\` remaining (Sudoku.com 2022-10-22) [${i + 1}]`, () => {
            const houseModel = newHouseModel([
                Cage.ofSum(19).at(0, 2).at(0, 3).at(0, 4).at(1, 2).new(),
                Cage.ofSum(22).at(2, 2).at(3, 2).at(3, 3).new(),
                Cage.ofSum(10).at(1, 3).at(2, 3).new(),
                Cage.ofSum(14).at(1, 4).at(2, 4).new(),
                Cage.ofSum(6).at(4, 3).at(5, 3).new(),
                Cage.ofSum(8).at(3, 4).at(3, 5).new(),
                Cage.ofSum(9).at(4, 4).at(4, 5).new(),
                Cage.ofSum(17).at(5, 4).at(6, 3).at(6, 4).new(),
                Cage.ofSum(6).at(5, 5).new(),
                Cage.ofSum(10).at(8, 3).at(8, 4).new(),
                Cage.ofSum(23).at(0, 3).at(0, 4).at(3, 2).at(3, 3).setIsInput(false).new(),
                Cage.ofSum(23).at(2, 2).at(3, 2).at(6, 3).at(6, 4).setIsInput(false).new(),
                Cage.ofSum(15).at(1, 3).at(1, 4).setIsInput(false).new(),
                Cage.ofSum(9).at(2, 3).at(2, 4).setIsInput(false).new(),
                Cage.ofSum(25).at(0, 2).at(0, 3).at(1, 2).at(6, 3).at(8, 3).setIsInput(false).new()
            ]);

            expect(segment(houseModel.cages, 4)).toEqual({
                nonOverlappingCages: [
                    Cage.ofSum(19).at(0, 2).at(0, 3).at(0, 4).at(1, 2).new(),
                    Cage.ofSum(22).at(2, 2).at(3, 2).at(3, 3).new(),
                    Cage.ofSum(10).at(1, 3).at(2, 3).new(),
                    Cage.ofSum(14).at(1, 4).at(2, 4).new(),
                    Cage.ofSum(6).at(4, 3).at(5, 3).new(),
                    Cage.ofSum(8).at(3, 4).at(3, 5).new(),
                    Cage.ofSum(9).at(4, 4).at(4, 5).new(),
                    Cage.ofSum(17).at(5, 4).at(6, 3).at(6, 4).new(),
                    Cage.ofSum(6).at(5, 5).new(),
                    Cage.ofSum(10).at(8, 3).at(8, 4).new()
                ],
                overlappingCages: [
                    Cage.ofSum(23).at(0, 3).at(0, 4).at(3, 2).at(3, 3).setIsInput(false).new(),
                    Cage.ofSum(23).at(2, 2).at(3, 2).at(6, 3).at(6, 4).setIsInput(false).new(),
                    Cage.ofSum(15).at(1, 3).at(1, 4).setIsInput(false).new(),
                    Cage.ofSum(9).at(2, 3).at(2, 4).setIsInput(false).new(),
                    Cage.ofSum(25).at(0, 2).at(0, 3).at(1, 2).at(6, 3).at(8, 3).setIsInput(false).new()
                ]
            });

            _.range(ITERATION_COUNT).forEach(() => {
                segment(houseModel.cages, 4);
            });
        });
    });
});
