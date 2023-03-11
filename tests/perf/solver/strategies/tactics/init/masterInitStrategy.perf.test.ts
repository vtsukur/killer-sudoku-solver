import * as _ from 'lodash';
import { MasterInitStrategy } from '../../../../../../src/solver/strategies/tactics/init/masterInitStrategy';
import { puzzleSamples } from '../../../../../unit/puzzle/puzzleSamples';
import { newContext } from '../../../../../unit/solver/strategies/tactics/init/builders';

describe('Performance tests for `MasterInitStrategy`', () => {

    const TESTS_COUNT = 10;
    const ITERATION_COUNT = 500;

    _.range(TESTS_COUNT).forEach(i => {
        test(`Applying \`Strategy\` onto \`Nonet\`s within Daily Challenge (2022-11-01) by Sudoku.com [${i}]`, () => {
            _.range(ITERATION_COUNT).forEach(() => {
                const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
                new MasterInitStrategy(context).execute();
            });
        });
    });

});
