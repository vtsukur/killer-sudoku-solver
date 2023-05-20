import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { Combo } from '../../../../../src/solver/math';
import { ComparablePerformanceTestConfig, doRunFunctionalAndPerformanceTests } from './commons';
import { CageModel6PlusReducer } from '../../../../../src/solver/strategies/reduction/cageModel6PlusReducer';
import { createAndInitPerfCageM } from '../../models/elements/cageModelBuilder.perf';

describe('Performance tests for `CageModel6PlusReducer`', () => {

    test('Comparable test for real production scenario #1', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createAndInitPerfCageM(6, 27),
            prepareForReduction: (cageM) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(5, 7));
                cageM.cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 7, 8, 9));
                cageM.cellMs[4].reduceNumOpts(SudokuNumsSet.of(1, 2, 7, 8, 9));
                cageM.cellMs[5].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
            },
            expectAfterTargetReduction: (cageM, reduction) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 5, 7 ]);
                expect(cageM.cellMs[3].numOpts()).toEqual([ 1, 2, 7, 8 ]);
                expect(cageM.cellMs[4].numOpts()).toEqual([ 1, 2, 7, 8 ]);
                expect(cageM.cellMs[5].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);

                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 3, 4, 8, 9),
                    // Deleted: Combo.of(1, 2, 3, 5, 7, 9),
                    Combo.of(1, 2, 4, 5, 7, 8)
                ]);

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[3]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[4]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[5]).nums).toHaveLength(0);
            }
        });
    });

    const runComparablePerformanceTests = (config: ComparablePerformanceTestConfig) => {
        doRunFunctionalAndPerformanceTests(config, createReducer, 'Optimal');
    };

    const createReducer = (cageM: CageModel) => {
        return new CageModel6PlusReducer(cageM);
    };

});
