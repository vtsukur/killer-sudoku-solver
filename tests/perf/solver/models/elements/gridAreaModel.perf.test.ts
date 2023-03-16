import * as _ from 'lodash';
import { Cage } from '../../../../../src/puzzle/cage';
import { GridAreaModel } from '../../../../../src/solver/models/elements/gridAreaModel';
import { expectGridAreaModel } from '../../../../unit/solver/models/elements/gridAreaModel.test';

describe('Performance tests for `GridAreaModel`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(10_000);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Sudoku.com 2022-10-19: 4 derived \`Cage\`s and 2 with obvious overlap [${i + 1}]`, () => {
            const cages = [
                Cage.ofSum(9).at(7, 8).at(8, 8).new(),
                Cage.ofSum(11).at(8, 7).at(8, 8).setIsInput(false).new(),
                Cage.ofSum(15).at(7, 7).at(8, 7).new(),
                Cage.ofSum(13).at(6, 6).at(7, 6).at(8, 6).setIsInput(false).new(),
                Cage.ofSum(13).at(7, 7).at(7, 8).setIsInput(false).new(),
                Cage.ofSum(8).at(6, 7).at(6, 8).setIsInput(false).new()
            ];

            expectGridAreaModel(GridAreaModel.from(cages),
                [
                    Cage.ofSum(9).at(7, 8).at(8, 8).new(),
                    Cage.ofSum(15).at(7, 7).at(8, 7).new(),
                    Cage.ofSum(13).at(6, 6).at(7, 6).at(8, 6).setIsInput(false).new(),
                    Cage.ofSum(8).at(6, 7).at(6, 8).setIsInput(false).new()
                ],
                [
                    Cage.ofSum(11).at(8, 7).at(8, 8).setIsInput(false).new(),
                    Cage.ofSum(13).at(7, 7).at(7, 8).setIsInput(false).new()
                ]
            );

            ITERATIONS.forEach(() => {
                GridAreaModel.from(cages);
            });
        });

        test(`Sudoku.com 2022-10-22: 5 derived \`Cage\`s all with obvious overlap [${i + 1}]`, () => {
            const cages = [
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
            ];

            expectGridAreaModel(GridAreaModel.from(cages, 4),
                [
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
                [
                    Cage.ofSum(23).at(0, 3).at(0, 4).at(3, 2).at(3, 3).setIsInput(false).new(),
                    Cage.ofSum(23).at(2, 2).at(3, 2).at(6, 3).at(6, 4).setIsInput(false).new(),
                    Cage.ofSum(15).at(1, 3).at(1, 4).setIsInput(false).new(),
                    Cage.ofSum(9).at(2, 3).at(2, 4).setIsInput(false).new(),
                    Cage.ofSum(25).at(0, 2).at(0, 3).at(1, 2).at(6, 3).at(8, 3).setIsInput(false).new()
                ]
            );

            ITERATIONS.forEach(() => {
                GridAreaModel.from(cages, 4);
            });
        });

        test(`Sudoku.com random challenge: 4 derived \`Cage\`s w/o obvious overlap [${i + 1}]`, () => {
            const cages = [
                Cage.ofSum(3).at(0, 4).new(),
                Cage.ofSum(20).at(1, 3).at(1, 4).at(2, 4).new(),
                Cage.ofSum(7).at(5, 3).at(5, 4).new(),
                Cage.ofSum(13).at(6, 3).at(7, 3).new(),
                Cage.ofSum(3).at(6, 4).at(7, 4).new(),
                Cage.ofSum(1).at(0, 3).new(),
                Cage.ofSum(5).at(0, 2).new(),
                Cage.ofSum(14).at(0, 5).at(1, 5).at(2, 5).setIsInput(false).new(),
                Cage.ofSum(8).at(3, 3).new(),
                Cage.ofSum(7).at(2, 3).new(),
                Cage.ofSum(1).at(4, 2).new(),
                Cage.ofSum(3).at(5, 2).new(),
                Cage.ofSum(7).at(3, 5).at(5, 5).setIsInput(false).new(),
                Cage.ofSum(29).at(1, 2).at(2, 2).at(3, 2).at(6, 2).at(7, 2).setIsInput(false).new(),
                Cage.ofSum(15).at(6, 5).at(7, 5).at(8, 5).setIsInput(false).new(),
                Cage.ofSum(14).at(8, 3).at(8, 4).new(),
                Cage.ofSum(7).at(8, 2).new(),
                Cage.ofSum(14).at(3, 4).at(4, 3).at(4, 4).new(),
                Cage.ofSum(9).at(4, 5).new(),
                Cage.ofSum(16).at(1, 3).at(4, 3).at(5, 3).at(8, 3).setIsInput(false).new()
            ];

            expectGridAreaModel(GridAreaModel.from(cages, 4),
                [
                    Cage.ofSum(3).at(0, 4).new(),
                    Cage.ofSum(20).at(1, 3).at(1, 4).at(2, 4).new(),
                    Cage.ofSum(7).at(5, 3).at(5, 4).new(),
                    Cage.ofSum(13).at(6, 3).at(7, 3).new(),
                    Cage.ofSum(3).at(6, 4).at(7, 4).new(),
                    Cage.ofSum(1).at(0, 3).new(),
                    Cage.ofSum(5).at(0, 2).new(),
                    Cage.ofSum(8).at(3, 3).new(),
                    Cage.ofSum(7).at(2, 3).new(),
                    Cage.ofSum(1).at(4, 2).new(),
                    Cage.ofSum(3).at(5, 2).new(),
                    Cage.ofSum(14).at(8, 3).at(8, 4).new(),
                    Cage.ofSum(7).at(8, 2).new(),
                    Cage.ofSum(14).at(3, 4).at(4, 3).at(4, 4).new(),
                    Cage.ofSum(9).at(4, 5).new(),

                    Cage.ofSum(14).at(0, 5).at(1, 5).at(2, 5).setIsInput(false).new(),
                    Cage.ofSum(7).at(3, 5).at(5, 5).setIsInput(false).new(),
                    Cage.ofSum(29).at(1, 2).at(2, 2).at(3, 2).at(6, 2).at(7, 2).setIsInput(false).new(),
                    Cage.ofSum(15).at(6, 5).at(7, 5).at(8, 5).setIsInput(false).new(),
                ],
                [
                    Cage.ofSum(16).at(1, 3).at(4, 3).at(5, 3).at(8, 3).setIsInput(false).new()
                ]
            );

            ITERATIONS.forEach(() => {
                GridAreaModel.from(cages, 4);
            });
        });

        test.only(`Sudoku.com 2022-08-12: 12 \`Cage\`s and all are derived [${i + 1}]`, () => {
            const cages = [
                Cage.ofSum(32).at(0, 3).at(1, 3).at(2, 3).at(3, 0).at(4, 0).setIsInput(false).new(),
                Cage.ofSum(14).at(0, 4).at(0, 5).at(2, 5).setIsInput(false).new(),
                Cage.ofSum(24).at(2, 0).at(5, 3).at(6, 0).at(6, 1).at(6, 2).setIsInput(false).new(),
                Cage.ofSum(21).at(5, 0).at(5, 1).at(5, 2).at(5, 3).setIsInput(false).new(),
                Cage.ofSum(14).at(1, 0).at(1, 1).setIsInput(false).new(),
                Cage.ofSum(22).at(3, 0).at(3, 4).at(4, 0).setIsInput(false).new(),
                Cage.ofSum(22).at(4, 0).at(4, 1).at(4, 2).at(4, 3).setIsInput(false).new(),
                Cage.ofSum(23).at(2, 0).at(3, 0).at(3, 1).at(3, 2).at(3, 3).setIsInput(false).new(),
                Cage.ofSum(12).at(2, 0).at(2, 4).setIsInput(false).new(),
                Cage.ofSum(4).at(0, 0).at(0, 1).setIsInput(false).new(),
                Cage.ofSum(25).at(3, 0).at(3, 1).at(3, 2).at(3, 3).at(3, 4).setIsInput(false).new(),
                Cage.ofSum(25).at(2, 2).at(2, 3).at(5, 2).at(5, 3).at(6, 2).setIsInput(false).new()
            ];

            expectGridAreaModel(GridAreaModel.from(cages, 6),
                [
                    Cage.ofSum(14).at(0, 4).at(0, 5).at(2, 5).setIsInput(false).new(),
                    Cage.ofSum(14).at(1, 0).at(1, 1).setIsInput(false).new(),
                    Cage.ofSum(22).at(4, 0).at(4, 1).at(4, 2).at(4, 3).setIsInput(false).new(),
                    Cage.ofSum(12).at(2, 0).at(2, 4).setIsInput(false).new(),
                    Cage.ofSum(4).at(0, 0).at(0, 1).setIsInput(false).new(),
                    Cage.ofSum(25).at(3, 0).at(3, 1).at(3, 2).at(3, 3).at(3, 4).setIsInput(false).new(),
                    Cage.ofSum(25).at(2, 2).at(2, 3).at(5, 2).at(5, 3).at(6, 2).setIsInput(false).new()
                ],
                [
                    Cage.ofSum(32).at(0, 3).at(1, 3).at(2, 3).at(3, 0).at(4, 0).setIsInput(false).new(),
                    Cage.ofSum(24).at(2, 0).at(5, 3).at(6, 0).at(6, 1).at(6, 2).setIsInput(false).new(),
                    Cage.ofSum(21).at(5, 0).at(5, 1).at(5, 2).at(5, 3).setIsInput(false).new(),
                    Cage.ofSum(22).at(3, 0).at(3, 4).at(4, 0).setIsInput(false).new(),
                    Cage.ofSum(23).at(2, 0).at(3, 0).at(3, 1).at(3, 2).at(3, 3).setIsInput(false).new()
                ]
            );

            ITERATIONS.forEach(() => {
                GridAreaModel.from(cages, 6);
            });
        });

    });

});
