import * as _ from 'lodash';
import { SudokuNumsSet } from '../../../../src/solver/sets';

describe('Performance tests for `SudokuNumsSet`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(100_000);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Multiple mutations of different kinds and getting \`nums\` after each [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const set = SudokuNumsSet.of(1, 6, 9);
                set.addAll(SudokuNumsSet.of(2, 3, 4));
                set.nums;
                set.union(SudokuNumsSet.of(3, 4, 6, 7, 9));
                set.nums;
                set.deleteAll(SudokuNumsSet.of(2, 6, 9));
                set.nums;
            });
        });

        test.skip(`Creation of single num set [${i}]`, () => {
            ITERATIONS.forEach(() => {
                SudokuNumsSet.ofSingle(5);
            });
        });

    });

});
