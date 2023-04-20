import * as _ from 'lodash';
import { SumCombos } from '../../../../src/solver/math';

describe('Performance tests for `SumCombos`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(500_000);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Number combinations to form a sum out of 5 unique numbers [${i}]`, () => {
            ITERATIONS.forEach(() => {
                SumCombos.enumerate(25, 5);
            });
        });

    });

});
