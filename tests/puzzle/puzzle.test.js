import _ from 'lodash';
import { Cage } from '../../src/puzzle/cage';
import { Puzzle } from '../../src/puzzle/puzzle';
import { samplePuzzle } from './realPuzzleSamples';

const replaceLastCageInCorrectPuzzleWith = function(lastCage) {
    const cages = [...samplePuzzle.cages];
    cages.pop();
    cages.push(lastCage);
    return new Puzzle(cages);
};

describe('Puzzle tests', () => {
    test('Construction of puzzle storing cages', () => {
        const correctPuzzle = new Puzzle(samplePuzzle.cages);
        expect(correctPuzzle.cages).toEqual(samplePuzzle.cages);
    });

    test('Construction of invalid puzzle with a missing cell', () => {
        expect(() =>
            replaceLastCageInCorrectPuzzleWith(
                Cage.ofSum(16).at(8, 6).at(8, 7).mk()
            )
        ).toThrow('Invalid puzzle. 1 missing cell(s): (8, 8)');
    });

    test('Construction of invalid puzzle with two missing cells', () => {
        expect(() =>
            replaceLastCageInCorrectPuzzleWith(
                Cage.ofSum(9).at(8, 6).mk()
            )
        ).toThrow('Invalid puzzle. 2 missing cell(s): (8, 7), (8, 8)');
    });

    test('Construction of invalid puzzle with both a missing cell and a duplicate cell', () => {
        expect(() =>
        replaceLastCageInCorrectPuzzleWith(
                Cage.ofSum(16).at(8, 6)/* here comes the duplicate: */.at(0, 0).at(8, 8).mk()
            )
        ).toThrow('Invalid puzzle. 1 missing cell(s): (8, 7). 1 duplicate cell(s): (0, 0)');
    });

    test('Construction of invalid puzzle in which sum of all cages does not add up to 405', () => {
        expect(() =>
        replaceLastCageInCorrectPuzzleWith(
                // abnormal cage on the field: 116 instead of 16
                Cage.ofSum(17).at(8, 6).at(8, 7).at(8, 8).mk()
            )
        ).toThrow('Invalid puzzle. Expected sum of all cages to be 405. Actual: 406');
    });
});
