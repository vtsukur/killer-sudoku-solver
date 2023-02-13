import { Cage } from '../../../../src/puzzle/cage';
import { HouseCagesSegmentor } from '../../../../src/solver/transform/houseCagesSegmentor';
import { newHouseModel } from '../math/houseModelBuilder';

describe('Unit tests for `HouseCagesSegmentor`', () => {
    const segment = HouseCagesSegmentor.segmentByCellsOverlap;

    test('Segmentation of `House` `Cage`s with 2 overlapping `Cage`s (case 1)', () => {
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
    });

    test('Segmentation of `House` `Cage`s with 2 overlapping `Cage`s (case 2)', () => {
        const houseModel = newHouseModel([
            Cage.ofSum(9).at(7, 8).at(8, 8).new(), // non-overlapping
            Cage.ofSum(11).at(8, 7).at(8, 8).new(),
            Cage.ofSum(15).at(7, 7).at(8, 7).new(), // non-overlapping
            Cage.ofSum(13).at(6, 6).at(7, 6).at(8, 6).new(), // non-overlapping
            Cage.ofSum(13).at(7, 7).at(7, 8).new(),
            Cage.ofSum(8).at(6, 7).at(6, 8).new() // non-overlapping
        ]);

        expect(segment(houseModel.cages, houseModel.cells)).toEqual({
            nonOverlappingCages: [
                Cage.ofSum(9).at(7, 8).at(8, 8).new(),
                Cage.ofSum(15).at(7, 7).at(8, 7).new(),
                Cage.ofSum(13).at(6, 6).at(7, 6).at(8, 6).new(),
                Cage.ofSum(8).at(6, 7).at(6, 8).new()
            ],
            overlappingCages: [
                Cage.ofSum(11).at(8, 7).at(8, 8).new(),
                Cage.ofSum(13).at(7, 7).at(7, 8).new()
            ]
        });
    });
});
