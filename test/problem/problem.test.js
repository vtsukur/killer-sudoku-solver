import _ from 'lodash';
import { Cage } from '../../src/problem/cage';
import { Problem } from '../../src/problem/problem';
import { sampleProblem } from './realProblemSamples';

const replaceLastCageInCorrectProblemWith = function(lastCage) {
    const cages = [...sampleProblem.cages];
    cages.pop();
    cages.push(lastCage);
    return new Problem(cages);
};

describe('Problem tests', () => {
    test('Construction of problem storing cages', () => {
        const correctProblem = new Problem(sampleProblem.cages);
        expect(correctProblem.cages).toEqual(sampleProblem.cages);
    });

    test('Construction of invalid problem with a missing cell', () => {
        expect(() =>
            replaceLastCageInCorrectProblemWith(
                Cage.ofSum(16).at(8, 6).at(8, 7).mk()
            )
        ).toThrow('Invalid problem. 1 missing cell(s): (8, 8)');
    });

    test('Construction of invalid problem with two missing cells', () => {
        expect(() =>
            replaceLastCageInCorrectProblemWith(
                Cage.ofSum(9).at(8, 6).mk()
            )
        ).toThrow('Invalid problem. 2 missing cell(s): (8, 7), (8, 8)');
    });

    test('Construction of invalid problem with both a missing cell and a duplicate cell', () => {
        expect(() =>
            replaceLastCageInCorrectProblemWith(
                Cage.ofSum(16).at(8, 6)/* here comes the duplicate: */.at(8, 6).at(8, 8).mk()
            )
        ).toThrow('Invalid problem. 1 missing cell(s): (8, 7). 1 duplicate cell(s): (8, 6)');
    });

    test('Construction of invalid problem in which sum of all cages does not add up to 405', () => {
        expect(() =>
            replaceLastCageInCorrectProblemWith(
                // abnormal cage on the field: 116 instead of 16
                Cage.ofSum(17).at(8, 6).at(8, 7).at(8, 8).mk()
            )
        ).toThrow('Invalid problem. Expected sum of all cages to be 405. Actual: 406');
    });
});
