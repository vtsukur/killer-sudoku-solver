import _ from 'lodash';
import { Problem } from '../../src/problem/problem';
import { Cage } from '../../src/problem/cage';
import { sampleProblem } from './realProblemSamples';

const modifyCorrectProblem = function(lastCage) {
    const cages = [...sampleProblem.cages];
    cages.pop();
    cages.push(lastCage);
    return new Problem(cages);
};

describe('Problem tests', () => {
    test('Construction of correct problem', () => {
        const correctProblem = new Problem(sampleProblem.cages);
        expect(correctProblem.cages).toEqual(sampleProblem.cages);
    });

    test('Check incorrect problem in which amount of cells does not match expected field cells count', () => {
        expect(() =>
            new Problem([
                Cage.ofSum(405).at(0, 0).mk()
            ])
        ).toThrow(`Invalid problem definiton. Expected cell count: 81. Actual: 1`);
    });

    test('Check incorrect problem in which at least one of the cells is out of row solver range', () => {
        expect(() =>
            modifyCorrectProblem(
                Cage.ofSum(16).at(9, 8)/* outside of range */.at(8, 7).at(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected cell to be within the field. Actual cell: (9, 8)`);
    });

    test('Check incorrect problem in which at least one of the cells is out of column solver range', () => {
        expect(() =>
            modifyCorrectProblem(
                Cage.ofSum(16).at(8, 9)/* outside of range */.at(8, 7).at(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected cell to be within the field. Actual cell: (8, 9)`);
    });

    test('Check incorrect problem in which at least one of the cells is duplicated / not filled', () => {
        expect(() =>
            modifyCorrectProblem(
                Cage.ofSum(16).at(8, 6)/* here comes the duplicate */.at(8, 6).at(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Found cell duplicate: (8, 6)`);
    });

    test('Check incorrect problem in which overall cage does not match', () => {
        expect(() =>
            modifyCorrectProblem(
                // abnormal cage on the field: 116 instead of 16
                Cage.ofSum(116).at(8, 6).at(8, 7).at(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected field cage: 405. Actual: 505`);
    });
});
