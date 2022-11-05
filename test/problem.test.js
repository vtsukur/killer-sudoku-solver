import _ from 'lodash';
import { Problem, Sum, Cell } from '../src/problem';

const correctProblem = new Problem([
    // upper subgrids
    Sum.of(17).in(0, 0).in(1, 0).in(1, 1).mk(),
    Sum.of(7).in(0, 1).mk(),
    Sum.of(7).in(0, 2).in(0, 3).mk(),
    Sum.of(4).in(0, 4).in(0, 5).mk(),
    Sum.of(11).in(0, 6).in(1, 6).mk(),
    Sum.of(14).in(0, 7).in(1, 7).in(2, 7).mk(),
    Sum.of(14).in(0, 8).in(1, 8).in(2, 8).mk(),
    Sum.of(7).in(1, 2).in(1, 3).mk(),
    Sum.of(23).in(1, 4).in(1, 5).in(2, 3).in(2, 4).mk(),
    Sum.of(10).in(2, 0).in(2, 1).in(3, 1).mk(),
    Sum.of(9).in(2, 2).mk(),
    Sum.of(13).in(2, 5).in(2, 6).mk(),

    // middle subgrids
    Sum.of(17).in(3, 0).in(4, 0).in(4, 1).mk(),
    Sum.of(14).in(3, 2).in(3, 3).mk(),
    Sum.of(23).in(3, 4).in(4, 4).in(4, 5).in(4, 6).mk(),
    Sum.of(5).in(3, 5).in(3, 6).mk(),
    Sum.of(17).in(3, 7).in(3, 8).in(4, 7).mk(),
    Sum.of(4).in(4, 2).in(4, 3).mk(),
    Sum.of(10).in(4, 8).in(5, 8).mk(),
    Sum.of(16).in(5, 0).in(5, 1).in(6, 1).mk(),
    Sum.of(15).in(5, 2).in(6, 2).mk(),
    Sum.of(23).in(5, 3).in(5, 4).in(6, 3).in(6, 4).mk(),
    Sum.of(10).in(5, 5).in(6, 5).mk(),
    Sum.of(25).in(5, 6).in(6, 6).in(6, 7).in(7, 7).mk(),
    Sum.of(6).in(5, 7).mk(),

    // lower subgrids
    Sum.of(3).in(6, 0).in(7, 0).mk(),
    Sum.of(8).in(6, 8).in(7, 8).mk(),
    Sum.of(27).in(7, 1).in(7, 2).in(7, 3).in(8, 2).in(8, 3).mk(),
    Sum.of(6).in(7, 4).in(8, 4).mk(),
    Sum.of(12).in(7, 5).in(7, 6).in(8, 5).mk(),
    Sum.of(12).in(8, 0).in(8, 1).mk(),
    Sum.of(16).in(8, 6).in(8, 7).in(8, 8).mk()
]);

const modifyCorrectProblem = function(lastSum) {
    const sums = [...correctProblem.sums];
    sums.pop();
    sums.push(lastSum);
    return new Problem(sums);
};

describe('Problem tests', () => {
    test('Check correct problem', () => {
        correctProblem.checkCorrectness();
    });

    test('Check incorrect problem in which amount of cells does not match expected field cells count', () => {
        expect(() =>
            new Problem([
                Sum.of(405).in(0, 0).mk()
            ]).checkCorrectness()
        ).toThrow(`Invalid problem definiton. Expected cell count: 81. Actual: 1`);
    });

    test('Check incorrect problem in which at least one of the cells is out of row range', () => {
        expect(() =>
            modifyCorrectProblem(
                Sum.of(16).in(9, 8)/* outside of range */.in(8, 7).in(8, 8).mk()
            ).checkCorrectness()
        ).toThrow(`Invalid problem definiton. Expected cell to be within the field. Actual cell: (9, 8)`);
    });

    test('Check incorrect problem in which at least one of the cells is out of column range', () => {
        expect(() =>
            modifyCorrectProblem(
                Sum.of(16).in(8, 9)/* outside of range */.in(8, 7).in(8, 8).mk()
            ).checkCorrectness()
        ).toThrow(`Invalid problem definiton. Expected cell to be within the field. Actual cell: (8, 9)`);
    });

    test('Check incorrect problem in which at least one of the cells is duplicated / not filled', () => {
        expect(() =>
            modifyCorrectProblem(
                Sum.of(16).in(8, 6)/* here comes the duplicate */.in(8, 6).in(8, 8).mk()
            ).checkCorrectness()
        ).toThrow(`Invalid problem definiton. Found cell duplicate: (8, 6)`);
    });

    test('Check incorrect problem in which overall sum does not match', () => {
        expect(() =>
            modifyCorrectProblem(
                // abnormal sum on the field: 116 instead of 16
                Sum.of(116).in(8, 6).in(8, 7).in(8, 8).mk()
            ).checkCorrectness()
        ).toThrow(`Invalid problem definiton. Expected field sum: 405. Actual: 505`);
    });
});
