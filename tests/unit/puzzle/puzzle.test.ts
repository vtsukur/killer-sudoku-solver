import { Cage } from '../../../src/puzzle/cage';
import { InvalidProblemDefError } from '../../../src/puzzle/invalidProblemDefError';
import { Puzzle } from '../../../src/puzzle/puzzle';
import { puzzleSamples } from './puzzleSamples';

const replaceLastCageInCorrectPuzzleWith = function(lastCage: Cage) {
    const cages = [...puzzleSamples.reference.cages];
    cages.pop();
    cages.push(lastCage);
    return new Puzzle(cages);
};

describe('Puzzle tests', () => {
    test('Construction of Puzzle storing Cages', () => {
        const correctPuzzle = new Puzzle(puzzleSamples.reference.cages);
        expect(correctPuzzle.cages).toEqual(puzzleSamples.reference.cages);
    });

    test('Construction of invalid Puzzle with a missing Cell', () => {
        expect(() =>
            replaceLastCageInCorrectPuzzleWith(
                // Proper Cage is of sum 16 with Cells at (8, 6), (8, 7) and (8, 8).
                Cage.ofSum(16).at(8, 6).at(8, 7).mk()
            )
        ).toThrow(new InvalidProblemDefError('Invalid puzzle. Found 1 missing cell(s): (8, 8)'));
    });

    test('Construction of invalid Puzzle with 2 missing Cells', () => {
        expect(() =>
            replaceLastCageInCorrectPuzzleWith(
                // Proper Cage is of sum 16 with Cells at (8, 6), (8, 7) and (8, 8).
                Cage.ofSum(9).at(8, 6).mk()
            )
        ).toThrow(new InvalidProblemDefError('Invalid puzzle. Found 2 missing cell(s): (8, 7), (8, 8)'));
    });

    test('Construction of invalid Puzzle with a duplicate Cell', () => {
        expect(() =>
        replaceLastCageInCorrectPuzzleWith(
                // Proper Cage is of sum 16 with Cells at (8, 6), (8, 7) and (8, 8).
                Cage.ofSum(16).at(8, 6).at(8, 7).at(8, 8)/* here is the duplicate: */.at(0, 0).mk()
            )
        ).toThrow(new InvalidProblemDefError('Invalid puzzle. Found 1 duplicate cell(s): (0, 0)'));
    });

    test('Construction of invalid Puzzle with 2 duplicate Cells', () => {
        expect(() =>
        replaceLastCageInCorrectPuzzleWith(
                // Proper Cage is of sum 16 with Cells at (8, 6), (8, 7) and (8, 8).
                Cage.ofSum(16).at(8, 6).at(8, 7).at(8, 8)/* here are the duplicates: */.at(0, 0).at(0, 1).mk()
            )
        ).toThrow(new InvalidProblemDefError('Invalid puzzle. Found 2 duplicate cell(s): (0, 0), (0, 1)'));
    });

    test('Construction of invalid Puzzle with both a missing Cell and a duplicate Cell with only missing Cells reported', () => {
        expect(() =>
        replaceLastCageInCorrectPuzzleWith(
                // Proper Cage is of sum 16 with Cells at (8, 6), (8, 7) and (8, 8).
                Cage.ofSum(16).at(8, 6).at(8, 8)/* and here comes the duplicate: */.at(0, 0).mk()
            )
        ).toThrow(new InvalidProblemDefError('Invalid puzzle. Found 1 duplicate cell(s): (0, 0)'));
    });

    test('Construction of invalid Puzzle in which sum of all Cages does not add up to 405', () => {
        expect(() =>
        replaceLastCageInCorrectPuzzleWith(
                // Abnormal Cage on the field: 116 instead of 16
                Cage.ofSum(17).at(8, 6).at(8, 7).at(8, 8).mk()
            )
        ).toThrow(new InvalidProblemDefError('Invalid puzzle. Expected sum of cages to equal grid sum of 405. Actual: 406'));
    });
});
