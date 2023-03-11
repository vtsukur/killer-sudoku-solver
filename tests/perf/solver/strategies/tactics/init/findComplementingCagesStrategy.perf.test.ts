import * as _ from 'lodash';
import { FindComplementingCagesStrategy } from '../../../../../../src/solver/strategies/tactics/init/findComplementingCagesStrategy';
import { puzzleSamples } from '../../../../../unit/puzzle/puzzleSamples';
import { newContext } from '../../../../../unit/solver/strategies/tactics/init/builders';

describe('Performance tests for `FindComplementingCagesStrategy`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(500);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Applying \`Strategy\` within Daily Challenge (2022-10-22) by Sudoku.com [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
                new FindComplementingCagesStrategy(context).execute();
            });
        });

    });

});
