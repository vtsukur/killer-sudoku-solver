import * as _ from 'lodash';
import { newContext } from '../../../../unit/solver/strategies/tactics/init/builders';
import { puzzleSamples } from '../../../../unit/puzzle/puzzleSamples';
import { MasterInitStrategy } from '../../../../../src/solver/strategies/tactics/init';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { Grid } from '../../../../../src/puzzle/grid';
import { SudokuNumsSet } from '../../../../../src/solver/sets';

describe('Performance tests for `MasterModelReduction`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(10_000);

    const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
    const model = context.model;
    new MasterInitStrategy(context).execute();
    // const allSudokuNumbers = SudokuNumsSet.all();
    // for (const row of Grid.SIDE_INDICES) {
    //     for (const col of Grid.SIDE_INDICES) {
    //         model.cellModelAt(row, col).
    //     }
    // }

    _.range(TESTS_COUNT).forEach(i => {

        test(`Applying sample reduction after \`MasterInitStrategy\` of Daily Challenge (2022-11-01) by Sudoku.com [${i}]`, () => {
            const sut = new MasterModelReduction();

            ITERATIONS.forEach(() => {
                for (const row of Grid.SIDE_INDICES) {
                    for (const col of Grid.SIDE_INDICES) {
                        const cellM = model.cellModelAt(row, col);
                        sut.deleteNumOpt(cellM, 9);
                        // sut.tryDeleteNumOpt(cellM, 2);
                        // sut.tryReduceNumOpts(cellM, allSudokuNumbers);
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
