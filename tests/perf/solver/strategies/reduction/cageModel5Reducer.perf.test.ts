import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { Combo } from '../../../../../src/solver/math';
import { ComparablePerformanceTestConfig, doRunFunctionalAndPerformanceTests } from './commons';
import { CageModel5Reducer } from '../../../../../src/solver/strategies/reduction/cageModel5Reducer';
import { createAndInitPerfCageM } from '../../models/elements/cageModelBuilder.perf';

describe('Performance tests for `CageModel5Reducer`', () => {

    test('Comparable test for real production scenario #1', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createAndInitPerfCageM(5, 22),
            prepareForReduction: (cageM) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(3, 4, 5, 7, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 3, 4, 5, 6, 7));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(4, 7));
                cageM.cellMs[3].reduceNumOpts(SudokuNumsSet.of(5, 8));
                cageM.cellMs[4].reduceNumOpts(SudokuNumsSet.of(1, 2));
            },
            expectAfterTargetReduction: (cageM, reduction) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 3, 4, 5, 7, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 2, 3, 5, 6 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 4, 7 ]);
                expect(cageM.cellMs[3].numOpts()).toEqual([ 5, 8 ]);
                expect(cageM.cellMs[4].numOpts()).toEqual([ 1, 2 ]);

                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 3, 7, 9),
                    // Deleted: Combo.of(1, 2, 4, 6, 9),
                    Combo.of(1, 2, 4, 7, 8),
                    // Deleted: Combo.of(1, 2, 5, 6, 8),
                    Combo.of(1, 3, 4, 5, 9),
                    Combo.of(1, 3, 4, 6, 8),
                    Combo.of(1, 3, 5, 6, 7),
                    Combo.of(2, 3, 4, 5, 8),
                    // Deleted: Combo.of(2, 3, 4, 6, 7)
                ]);

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 4, 7 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[3]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[4]).nums).toHaveLength(0);
            }
        });
    });

    test('Comparable test for real production scenario #3', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createAndInitPerfCageM(5, 24),
            prepareForReduction: (cageM) => {
                cageM.comboSet.deleteCombo(Combo.of(1, 4, 5, 6, 8));
                cageM.comboSet.deleteCombo(Combo.of(2, 3, 4, 7, 8));
                cageM.comboSet.deleteCombo(Combo.of(2, 4, 5, 6, 7));

                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 7, 8, 9));
                cageM.cellMs[3].reduceNumOpts(SudokuNumsSet.of(3, 5, 7, 8, 9));
                cageM.cellMs[4].reduceNumOpts(SudokuNumsSet.of(4));
            },
            expectAfterTargetReduction: (cageM, reduction) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 2, 3, 6, 7, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2, 3, 6, 7, 8, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 2, 3, 7, 8, 9 ]);
                expect(cageM.cellMs[3].numOpts()).toEqual([ 3, 7, 8, 9 ]);
                expect(cageM.cellMs[4].numOpts()).toEqual([ 4 ]);

                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 4, 8, 9),
                    Combo.of(1, 3, 4, 7, 9),
                    // Deleted: Combo.of(1, 3, 5, 7, 8),
                    Combo.of(2, 3, 4, 6, 9),
                    // Deleted: Combo.of(2, 3, 5, 6, 8)
                ]);

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 4, 5 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 4, 5 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 4, 5 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[3]).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[4]).nums).toHaveLength(0);
            }
        });
    });

    test('Comparable test for real production scenario #6', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createAndInitPerfCageM(5, 25),
            prepareForReduction: (cageM) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(5));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cageM.cellMs[3].reduceNumOpts(SudokuNumsSet.of(7));
                cageM.cellMs[4].reduceNumOpts(SudokuNumsSet.of(7, 9));
            },
            expectAfterTargetReduction: (cageM, reduction) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 5 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 3 ]);
                expect(cageM.cellMs[3].numOpts()).toEqual([ 7 ]);
                expect(cageM.cellMs[4].numOpts()).toEqual([ 9 ]);

                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 5, 8, 9),
                    // Deleted: Combo.of(1, 2, 6, 7, 9),
                    // Deleted: Combo.of(1, 3, 4, 8, 9),
                    Combo.of(1, 3, 5, 7, 9),
                    // Deleted: Combo.of(1, 3, 6, 7, 8),
                    // Deleted: Combo.of(1, 4, 5, 6, 9),
                    // Deleted: Combo.of(1, 4, 5, 7, 8),
                    // Deleted: Combo.of(2, 3, 4, 7, 9),
                    // Deleted: Combo.of(2, 3, 5, 6, 9),
                    // Deleted: Combo.of(2, 3, 5, 7, 8),
                    // Deleted: Combo.of(2, 4, 5, 6, 8),
                    // Deleted: Combo.of(3, 4, 5, 6, 7)
                ]);

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 1, 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[3]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[4]).nums).toEqual([ 7 ]);
            }
        });
    });

    const runComparablePerformanceTests = (config: ComparablePerformanceTestConfig) => {
        doRunFunctionalAndPerformanceTests(config, createOptimalReducer, 'Optimal');
    };

    const createOptimalReducer = (cageM: CageModel) => {
        return new CageModel5Reducer(cageM);
    };

});
