import _ from 'lodash';
import { Problem, Sum } from '../src/problem';

const correctProblem = new Problem([
    // upper subgrids
    Sum.of(17).cell(0, 0).cell(1, 0).cell(1, 1).mk(),
    Sum.of(7).cell(0, 1).mk(),
    Sum.of(7).cell(0, 2).cell(0, 3).mk(),
    Sum.of(4).cell(0, 4).cell(0, 5).mk(),
    Sum.of(11).cell(0, 6).cell(1, 6).mk(),
    Sum.of(14).cell(0, 7).cell(1, 7).cell(2, 7).mk(),
    Sum.of(14).cell(0, 8).cell(1, 8).cell(2, 8).mk(),
    Sum.of(7).cell(1, 2).cell(1, 3).mk(),
    Sum.of(23).cell(1, 4).cell(1, 5).cell(2, 3).cell(2, 4).mk(),
    Sum.of(10).cell(2, 0).cell(2, 1).cell(3, 1).mk(),
    Sum.of(9).cell(2, 2).mk(),
    Sum.of(13).cell(2, 5).cell(2, 6).mk(),

    // middle subgrids
    Sum.of(17).cell(3, 0).cell(4, 0).cell(4, 1).mk(),
    Sum.of(14).cell(3, 2).cell(3, 3).mk(),
    Sum.of(23).cell(3, 4).cell(4, 4).cell(4, 5).cell(4, 6).mk(),
    Sum.of(5).cell(3, 5).cell(3, 6).mk(),
    Sum.of(17).cell(3, 7).cell(3, 8).cell(4, 7).mk(),
    Sum.of(4).cell(4, 2).cell(4, 3).mk(),
    Sum.of(10).cell(4, 8).cell(5, 8).mk(),
    Sum.of(16).cell(5, 0).cell(5, 1).cell(6, 1).mk(),
    Sum.of(15).cell(5, 2).cell(6, 2).mk(),
    Sum.of(23).cell(5, 3).cell(5, 4).cell(6, 3).cell(6, 4).mk(),
    Sum.of(10).cell(5, 5).cell(6, 5).mk(),
    Sum.of(25).cell(5, 6).cell(6, 6).cell(6, 7).cell(7, 7).mk(),
    Sum.of(6).cell(5, 7).mk(),

    // lower subgrids
    Sum.of(3).cell(6, 0).cell(7, 0).mk(),
    Sum.of(8).cell(6, 8).cell(7, 8).mk(),
    Sum.of(27).cell(7, 1).cell(7, 2).cell(7, 3).cell(8, 2).cell(8, 3).mk(),
    Sum.of(6).cell(7, 4).cell(8, 4).mk(),
    Sum.of(12).cell(7, 5).cell(7, 6).cell(8, 5).mk(),
    Sum.of(12).cell(8, 0).cell(8, 1).mk(),
    Sum.of(16).cell(8, 6).cell(8, 7).cell(8, 8).mk()
]);

const modifyCorrectProblem = function(lastSum) {
    const sums = [...correctProblem.sums];
    sums.pop();
    sums.push(lastSum);
    return new Problem(sums);
};

describe('Problem tests', () => {
    test('Check incorrect problem in which amount of cells does not match expected field cells count', () => {
        expect(() =>
            new Problem([
                Sum.of(405).cell(0, 0).mk()
            ])
        ).toThrow(`Invalid problem definiton. Expected cell count: 81. Actual: 1`);
    });

    test('Check incorrect problem in which at least one of the cells is out of row range', () => {
        expect(() =>
            modifyCorrectProblem(
                Sum.of(16).cell(9, 8)/* outside of range */.cell(8, 7).cell(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected cell to be within the field. Actual cell: (9, 8)`);
    });

    test('Check incorrect problem in which at least one of the cells is out of column range', () => {
        expect(() =>
            modifyCorrectProblem(
                Sum.of(16).cell(8, 9)/* outside of range */.cell(8, 7).cell(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected cell to be within the field. Actual cell: (8, 9)`);
    });

    test('Check incorrect problem in which at least one of the cells is duplicated / not filled', () => {
        expect(() =>
            modifyCorrectProblem(
                Sum.of(16).cell(8, 6)/* here comes the duplicate */.cell(8, 6).cell(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Found cell duplicate: (8, 6)`);
    });

    test('Check incorrect problem in which overall sum does not match', () => {
        expect(() =>
            modifyCorrectProblem(
                // abnormal sum on the field: 116 instead of 16
                Sum.of(116).cell(8, 6).cell(8, 7).cell(8, 8).mk()
            )
        ).toThrow(`Invalid problem definiton. Expected field sum: 405. Actual: 505`);
    });
});
