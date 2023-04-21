import * as _ from 'lodash';
import { SumCombinatorics } from '../../../../src/solver/math';

describe('Performance tests for `SumCombos`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(1_000_000);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Number combinations to form a sum out of 5 unique numbers [${i}]`, () => {
            ITERATIONS.forEach(() => {
                SumCombinatorics.BY_COUNT_BY_SUM[5][25];
            });
        });

    });

});
