import * as _ from 'lodash';
import { SumAddendsCombinatorics } from '../../../../src/solver/math';

describe('Performance tests for `SumAddendsCombinatorics`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(100_000);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Number combinations to form a sum out of 5 unique numbers [${i}]`, () => {
            ITERATIONS.forEach(() => {
                SumAddendsCombinatorics.enumerate(25, 5);
            });
        });

    });

});
