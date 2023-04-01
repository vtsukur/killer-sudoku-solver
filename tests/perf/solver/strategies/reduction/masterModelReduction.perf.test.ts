import * as _ from 'lodash';
import { newContext } from '../../../../unit/solver/strategies/tactics/init/builders';
import { puzzleSamples } from '../../../../unit/puzzle/puzzleSamples';
import { MasterInitStrategy } from '../../../../../src/solver/strategies/tactics/init';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { Grid } from '../../../../../src/puzzle/grid';

describe('Performance tests for `MasterModelReduction`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(10_000);

    const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
    const model = context.model;
    new MasterInitStrategy(context).execute();

    _.range(TESTS_COUNT).forEach(i => {

        test(`\`peek\`-ing all \`CageModel\`s after \`MasterInitStrategy\` of Daily Challenge (2022-11-01) by Sudoku.com [${i}]`, () => {
            const sut = new MasterModelReduction();

            ITERATIONS.forEach(() => {
                for (const row of Grid.SIDE_INDICES) {
                    for (const col of Grid.SIDE_INDICES) {
                        sut.markAsImpacted(model.cellModelAt(row, col));
                    }
                }

                let cageM = sut.peek();
                while (cageM) {
                    cageM = sut.peek();
                }
            });
        });

    });

});
