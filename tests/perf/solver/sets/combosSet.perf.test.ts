import * as _ from 'lodash';
import { SumAddendsCombinatorics } from '../../../../src/solver/math';
import { CombosSet } from '../../../../src/solver/sets';

describe('Performance tests for `SumAddendsCombosSet`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(100_000);

    const combinatorics = SumAddendsCombinatorics.enumerate(25, 5);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Multiple mutations of different kinds and getting \`Combo\`s after each [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const set = CombosSet.newEmpty(combinatorics);
                for (const combo of combinatorics.val) {
                    set.addCombo(combo);
                }
            });
        });

    });

});
