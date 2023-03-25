import * as _ from 'lodash';
import { ReducePermsForCagesStrategy } from '../../../../../../src/solver/strategies/tactics/loop/reducePermsForCagesStrategy';
import { puzzleSamples } from '../../../../../unit/puzzle/puzzleSamples';
import { newContext } from '../../../../../unit/solver/strategies/tactics/init/builders';

describe('Performance tests for `ReducePermsForCagesStrategy`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(10);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Applying \`Strategy\` for Daily Challenge (2022-11-01) by Sudoku.com [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
                context.setReductionToAll();
                new ReducePermsForCagesStrategy(context).execute();
            });
        });

    });

});
