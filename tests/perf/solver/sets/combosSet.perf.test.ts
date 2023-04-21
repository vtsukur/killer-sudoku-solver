import * as _ from 'lodash';
import { SumCombos } from '../../../../src/solver/math';
import { CombosSet } from '../../../../src/solver/sets';

describe('Performance tests for `CombosSet`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(100_000);

    const combinatorics = SumCombos.BY_COUNT_BY_SUM[5][25];

    _.range(TESTS_COUNT).forEach(i => {

        test(`Multiple mutations of different kinds and getting \`Combo\`s after each [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const set = CombosSet.newEmpty(combinatorics);
                for (const combo of combinatorics.val) {
                    set.addCombo(combo);
                }
                set.combos;
            });
        });

    });

});
