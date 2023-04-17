import { Solver } from '../../../../../src/solver/solver';
import { puzzleSamples } from '../../../../unit/puzzle/puzzleSamples';
import { logFactory } from '../../../../../src/util/logFactory';
import { Cell } from '../../../../../src/puzzle/cell';
import { Cage } from '../../../../../src/puzzle/cage';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CageModel2PartialReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel2PartialReducer';
import { CageModel2ReducerRouter } from '../../../../../src/solver/strategies/reduction/archive/cageModel2ReducerRouter';
import { CachedNumRanges } from '../../../../../src/util/cachedNumRanges';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel2FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel2FullReducer';
import { performance } from 'perf_hooks';
import { Combo } from '../../../../../src/solver/math';
import { LockableCellModel } from './lockableCellModel';
import { LockableCageModel } from './lockableCageModel';
import { CageModel2Reducer } from '../../../../../src/solver/strategies/reduction/cageModel2Reducer';
import { ComparablePerformanceTestConfig, doRunFunctionalAndPerformanceTests } from './commons';
import { CageModel2DbReducer } from '../../../../../src/solver/strategies/reduction/cageModel2DbReducer';

const log = logFactory.withLabel('cageModel2Reducer.perf');

describe('Performance tests for `CageModel2Reducer`', () => {

    const sudokuDotCom = puzzleSamples.sudokuDotCom;
    const solver = new Solver();

    test('Comparable test for 1 `Combo`, 3 present numbers and 5 deleted numbers', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createReferenceCageM(9),
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
            createReferenceCageModel: () => createReferenceCageM(9),
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
            createReferenceCageModel: () => createReferenceCageM(14),
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
            createReferenceCageModel: () => createReferenceCageM(10),
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

    const createReferenceCageM = (sum: number) => {
        const cell1 = Cell.at(0, 0);
        const cell2 = Cell.at(0, 1);
        const cage = Cage.ofSum(sum).withCell(cell1).withCell(cell2).new();

        const cellM1 = new LockableCellModel(cell1);
        const cellM2 = new LockableCellModel(cell2);
        const cageM = new LockableCageModel(cage, [ cellM1, cellM2 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);

        cageM.initialReduce();

        return cageM;
    };

    const runComparablePerformanceTests = (config: ComparablePerformanceTestConfig) => {
        doRunFunctionalAndPerformanceTests(config, createFullReducer, 'Full');
        doRunFunctionalAndPerformanceTests(config, createPartialReducer, 'Partial');
        doRunFunctionalAndPerformanceTests(config, createOptimalReducer, 'Optimal');
        doRunFunctionalAndPerformanceTests(config, createOptimalDbReducer, 'Optimal (DB)');
    };

    const createFullReducer = (cageM: CageModel) => {
        return new CageModel2FullReducer(cageM);
    };

    const createPartialReducer = (cageM: CageModel) => {
        return new CageModel2PartialReducer(cageM);
    };

    const createOptimalReducer = (cageM: CageModel) => {
        return new CageModel2Reducer(cageM);
    };

    const createOptimalDbReducer = (cageM: CageModel) => {
        return new CageModel2DbReducer(cageM);
    };

    test.skip('Find solution for Sudoku.com puzzles', () => {
        // General warm up.
        CageModel2ReducerRouter.collectPerfStats = false;
        CachedNumRanges.ZERO_TO_N_LTE_81[3].forEach(() => {
            solveAllSudokuDotComPuzzles();
        });

        // Testing optimal reduction for `CageModel`s of size 2.
        CageModel2ReducerRouter.isAlwaysApplyOptimalReduction = true;

        // ... Warm up
        CageModel2ReducerRouter.collectPerfStats = false;
        solveAllSudokuDotComPuzzles();

        // ... Actual test
        log.info('Testing optimal reduction');
        CageModel2ReducerRouter.collectPerfStats = true;
        runAndMeasureAllSudokuDotComPuzzles('Optimal');
        const fullReductionStats = CageModel2ReducerRouter.captureMeasures();

        // Testing routing reduction for `CageModel`s of size 2.
        CageModel2ReducerRouter.isAlwaysApplyOptimalReduction = false;

        // ... Warm up
        CageModel2ReducerRouter.collectPerfStats = false;
        solveAllSudokuDotComPuzzles();

        // ... Actual test
        log.info('Testing routing reduction');
        CageModel2ReducerRouter.collectPerfStats = true;
        runAndMeasureAllSudokuDotComPuzzles('Routing');
        const routingReductionStats = CageModel2ReducerRouter.captureMeasures();

        // Comparing results
        expect(fullReductionStats.length).toBe(routingReductionStats.length);

        let fullReductionWins = 0;
        let fullReductionWinsWithDeletedLte1 = 0;
        let fullReductionWinsWithDeletedLte1SavedTime = 0;
        let partialReductionWins = 0;
        let partialReductionWinsWithDeletedLte1 = 0;
        let partialReductionWinsWithDeletedLte1SavedTime = 0;
        fullReductionStats.forEach((fullReductionStat, i) => {
            const routingReductionStat = routingReductionStats[i];
            if (fullReductionStat.isFullReduction && routingReductionStat.isFullReduction) return;

            const durationDelta = Math.abs(routingReductionStat.duration - fullReductionStat.duration);
            if (fullReductionStat.duration < routingReductionStat.duration) {
                ++fullReductionWins;
                if (fullReductionStat.deletedNumsCount === 1) {
                    ++fullReductionWinsWithDeletedLte1;
                    fullReductionWinsWithDeletedLte1SavedTime += durationDelta;
                }
            } else {
                ++partialReductionWins;
                if (fullReductionStat.deletedNumsCount === 1) {
                    ++partialReductionWinsWithDeletedLte1;
                    partialReductionWinsWithDeletedLte1SavedTime += durationDelta;
                }
            }
        });

        log.info(`Full reduction total wins: ${fullReductionWins}`);
        log.info(`Full reduction total wins (deleted === 1): ${fullReductionWinsWithDeletedLte1}`);
        log.info(`Full reduction total wins (deleted === 1 / saved time): ${fullReductionWinsWithDeletedLte1SavedTime}`);
        log.info(`Partial reduction total wins: ${partialReductionWins}`);
        log.info(`Partial reduction total wins (deleted === 1): ${partialReductionWinsWithDeletedLte1}`);
        log.info(`Partial reduction total wins (deleted === 1 / saved time): ${partialReductionWinsWithDeletedLte1SavedTime}`);
    });

    const runAndMeasureAllSudokuDotComPuzzles = (type: string) => {
        const startTime = performance.now();

        let i = 0;
        while (i++ < 10) {
            solveAllSudokuDotComPuzzles();
        }

        log.info(`${type} reducer: ${Math.trunc(performance.now() - startTime)} ms`);
    };

    const solveAllSudokuDotComPuzzles = () => {
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_04_06);
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_08_12);
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_08_30);
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_10_18);
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_10_19);
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_10_22);
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_10_25);
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_11_01);
        solver.solve(sudokuDotCom.dailyChallengeOf_2022_11_10);
        solver.solve(sudokuDotCom.randomExpertLevelChallenge);
    };

});
