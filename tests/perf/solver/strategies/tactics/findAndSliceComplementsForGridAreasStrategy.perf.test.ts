import * as _ from 'lodash';
import { CellIndicesCheckingSet } from '../../../../../src/solver/math';
import { FindAndSliceComplementsForGridAreasStrategy } from '../../../../../src/solver/strategies/tactics/findAndSliceComplementsForGridAreasStrategy';
import { puzzleSamples } from '../../../../unit/puzzle/puzzleSamples';
import { newContext } from '../../../../unit/solver/strategies/tactics/findAndSliceComplementsForGridAreasStrategy.test';

describe('Performance tests for `FindAndSliceComplementsForGridAreasStrategy`', () => {

    const TESTS_COUNT = 10;
    const ITERATION_COUNT = 500;

    _.range(TESTS_COUNT).forEach(i => {
        test(`Applying strategy within Daily Challenge (2022-10-22) by Sudoku.com [${i}]`, () => {
            _.range(ITERATION_COUNT).forEach(() => {
                const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
                new FindAndSliceComplementsForGridAreasStrategy(context).execute();
            });
        });
    });

});
