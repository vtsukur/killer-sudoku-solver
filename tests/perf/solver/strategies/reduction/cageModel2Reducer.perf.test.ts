import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel2FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel2FullReducer';
import { Combo } from '../../../../../src/solver/math';
import { CageModel2Reducer } from '../../../../../src/solver/strategies/reduction/cageModel2Reducer';
import { ComparablePerformanceTestConfig, doRunFunctionalAndPerformanceTests } from './commons';
import { createAndInitPerfCageM } from '../../models/elements/cageModelBuilder.perf';

const IS_RUN_SLOWER_ALTERNATIVES = false;

describe('Performance tests for `CageModel2Reducer`', () => {

    test('Comparable test for 1 `Combo`, 3 present numbers and 5 deleted numbers', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createAndInitPerfCageM(2, 9),
            prepareForReduction: (cageM, reduction) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 4, 5, 7));
                reduction.tryReduceNumOpts(cageM.cellMs[0], SudokuNumsSet.of(4));
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4 ]);

                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 4, 5, 7));
                reduction.tryReduceNumOpts(cageM.cellMs[1], SudokuNumsSet.of(4, 5));
                expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 5 ]);

                cageM.reduceToCombinationsContaining(4, reduction);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(4, 5)
                ]);

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 2, 5, 7 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 2, 7 ]);
            },
            expectAfterTargetReduction: (cageM) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 5 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(4, 5)
                ]);
            }
        });
    });

    test('Comparable test for 2 `Combo`s, 5 present numbers and 11 deleted numbers', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createAndInitPerfCageM(2, 9),
            prepareForReduction: (cageM, reduction) => {
                reduction.tryReduceNumOpts(cageM.cellMs[0], SudokuNumsSet.of(4, 5));
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4, 5 ]);

                reduction.tryReduceNumOpts(cageM.cellMs[1], SudokuNumsSet.of(4, 5, 8));
                expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 5, 8 ]);

                const allCombos = cageM.comboSet.combos;
                cageM.comboSet.deleteComboFailSafe(allCombos.find(combo => combo.has(2)) as Combo);
                cageM.comboSet.deleteComboFailSafe(allCombos.find(combo => combo.has(3)) as Combo);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 8),
                    Combo.of(4, 5)
                ]);

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 1, 2, 3, 6, 7, 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 1, 2, 3, 6, 7 ]);
            },
            expectAfterTargetReduction: (cageM) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4, 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 5 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(4, 5)
                ]);
            }
        });
    });

    test('Comparable test for 2 `Combo`s, 3 present numbers and 1 deleted number', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createAndInitPerfCageM(2, 14),
            prepareForReduction: (cageM, reduction) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(8, 9));
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8, 9 ]);

                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(5, 6));
                reduction.deleteNumOpt(cageM.cellMs[1], 5);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 6 ]);

                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(5, 9),
                    Combo.of(6, 8)
                ]);

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 5 ]);
            },
            expectAfterTargetReduction: (cageM) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 6 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(6, 8)
                ]);
            }
        });
    });

    test('Comparable test from real production scenario #1', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createAndInitPerfCageM(2, 10),
            prepareForReduction: (cageM, reduction) => {
                reduction.tryReduceNumOpts(cageM.cellMs[0], SudokuNumsSet.of(1, 3, 4, 6, 7, 9));
                reduction.tryReduceNumOpts(cageM.cellMs[1], SudokuNumsSet.of(1, 2, 4, 7));
            },
            expectAfterTargetReduction: (cageM, reduction) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 3, 6, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 4, 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 9),
                    // Deleted: Combo.of(2, 8),
                    Combo.of(3, 7),
                    Combo.of(4, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 1, 2, 4, 7, 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 2, 3, 6, 8, 9 ]);
            }
        });
    });

    const runComparablePerformanceTests = (config: ComparablePerformanceTestConfig) => {
        if (IS_RUN_SLOWER_ALTERNATIVES) {
            doRunFunctionalAndPerformanceTests(config, createFullReducer, 'Full');
        }
        doRunFunctionalAndPerformanceTests(config, createOptimalReducer, 'Optimal');
    };

    const createFullReducer = (cageM: CageModel) => {
        return new CageModel2FullReducer(cageM);
    };

    const createOptimalReducer = (cageM: CageModel) => {
        return new CageModel2Reducer(cageM);
    };

});
