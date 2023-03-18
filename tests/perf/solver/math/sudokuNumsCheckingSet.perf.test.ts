import * as _ from 'lodash';
import { SudokuNumsCheckingSet } from '../../../../src/solver/math/sudokuNumsCheckingSet';

describe('Performance tests for `SudokuNumsCheckingSet`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(100_000);

    _.range(TESTS_COUNT).forEach(i => {

        test.skip(`Multiple mutations of different kinds and getting \`nums\` after each [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const numsCheckingSet = SudokuNumsCheckingSet.of(1, 6, 9);
                numsCheckingSet.addAll(SudokuNumsCheckingSet.of(2, 3, 4));
                numsCheckingSet.nums();
                numsCheckingSet.union(SudokuNumsCheckingSet.of(3, 4, 6, 7, 9));
                numsCheckingSet.nums();
                numsCheckingSet.deleteAll(SudokuNumsCheckingSet.of(2, 6, 9));
                numsCheckingSet.nums();
            });
        });

        test(`Creation of single num set [${i}]`, () => {
            ITERATIONS.forEach(() => {
                SudokuNumsCheckingSet.ofSingle(5);
            });
        });

    });

});
