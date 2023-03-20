import * as _ from 'lodash';
import { SumAddendsCombosSet } from '../../../../src/solver/sets';

describe('Performance tests for `SumAddendsCombosSet`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(100_000);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Multiple mutations of different kinds and getting \`Combo\`s after each [${i}]`, () => {
            ITERATIONS.forEach(() => {
                new SumAddendsCombosSet();
            });
        });

    });

});
