import * as _ from 'lodash';
import { FindProtrusiveCagesStrategy } from '../../../../../../src/solver/strategies/tactics/init/findProtrusiveCagesStrategy';
import { puzzleSamples } from '../../../../../unit/puzzle/puzzleSamples';
import { newContext } from '../../../../../unit/solver/strategies/tactics/init/builders';

describe('Performance tests for `FindProtrusiveCagesStrategy`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(2000);

    _.range(TESTS_COUNT).forEach(i => {

        test(`Applying \`Strategy\` onto \`Nonet\`s within Daily Challenge (2022-10-22) by Sudoku.com [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
                new FindProtrusiveCagesStrategy(context).execute();
            });
        });

    });

});
