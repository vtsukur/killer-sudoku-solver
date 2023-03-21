import * as _ from 'lodash';
import { SumAddendsCombinatorics } from '../../../../src/solver/math';
import { SumAddendsCombosSet } from '../../../../src/solver/sets';
import { SumAddendsCombosSetPerf } from '../../../../src/solver/sets/sumAddendsCombosSet';

describe('Performance tests for `SumAddendsCombosSet`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(100_000);

    const combinatorics = SumAddendsCombinatorics.enumerate(25, 5);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Multiple mutations of different kinds and getting \`Combo\`s after each [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const set = new SumAddendsCombosSet(combinatorics);
                for (const combo of combinatorics.val) {
                    set.add(combo);
                }

                // const set = new SumAddendsCombosSetPerf(combinatorics);
            });
        });

    });

});
