import _ from 'lodash';
import { Problem } from '../../src/problem/problem';
import { Cage } from '../../src/problem/cage';
import { sampleProblem } from '../realProblemSamples';

const modifyCorrectProblem = function(lastSum) {
    const cages = [...sampleProblem.cages];
    cages.pop();
    cages.push(lastSum);
    return new Problem(cages);
};

describe('Problem tests', () => {
    test('Check incorrect problem in which amount of cells does not match expected field cells count', () => {
        expect(() =>
            new Problem([
                Cage.of(405).cell(0, 0).mk()
            ])
        ).toThrow(`Invalid problem definiton. Expected cell count: 81. Actual: 1`);
    });

    test('Check incorrect problem in which at least one of the cells is out of row range', () => {
        expect(() =>
            modifyCorrectProblem(
                Cage.of(16).cell(9, 8)/* outside of range */.cell(8, 7).cell(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected cell to be within the field. Actual cell: (9, 8)`);
    });

    test('Check incorrect problem in which at least one of the cells is out of column range', () => {
        expect(() =>
            modifyCorrectProblem(
                Cage.of(16).cell(8, 9)/* outside of range */.cell(8, 7).cell(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected cell to be within the field. Actual cell: (8, 9)`);
    });

    test('Check incorrect problem in which at least one of the cells is duplicated / not filled', () => {
        expect(() =>
            modifyCorrectProblem(
                Cage.of(16).cell(8, 6)/* here comes the duplicate */.cell(8, 6).cell(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Found cell duplicate: (8, 6)`);
    });

    test('Check incorrect problem in which overall cage does not match', () => {
        expect(() =>
            modifyCorrectProblem(
                // abnormal cage on the field: 116 instead of 16
                Cage.of(116).cell(8, 6).cell(8, 7).cell(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected field cage: 405. Actual: 505`);
    });
});
