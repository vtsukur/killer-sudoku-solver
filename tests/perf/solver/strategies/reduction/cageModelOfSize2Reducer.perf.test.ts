import { Solver } from '../../../../../src/solver/solver';
import { puzzleSamples } from '../../../../unit/puzzle/puzzleSamples';
import { logFactory } from '../../../../../src/util/logFactory';
import { Cell } from '../../../../../src/puzzle/cell';
import { Cage } from '../../../../../src/puzzle/cage';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { CageModelOfSize2PartialReducer } from '../../../../../src/solver/strategies/reduction/cageModelOfSize2PartialReducer';
import { CageModelOfSize2ReducerRouter } from '../../../../../src/solver/strategies/reduction/cageModelOfSize2ReducerRouter';
import { CachedNumRanges } from '../../../../../src/util/cachedNumRanges';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModelOfSize2Reducer } from '../../../../../src/solver/strategies/reduction/cageModelOfSize2Reducer';
import { performance } from 'perf_hooks';
import { Combo } from '../../../../../src/solver/math';
import { CageModelReducer } from '../../../../../src/solver/strategies/reduction/cageModelReducer';
import { LockableCellModel } from './lockableCellModel';
import { LockableMasterModelReduction } from './lockableMasterModelReduction';
import { LockableCageModel } from './lockableCageModel';

const log = logFactory.withLabel('cageModelOfSize2Reducer.perf');

type CreateReferenceCageModelFn = () => LockableCageModel;

type PrepareAndOrExpectReductionFn = (cageM: CageModel, reduction: MasterModelReduction) => void;

type ComparablePerformanceTestConfig = {

    createReferenceCageModel: CreateReferenceCageModelFn;

    prepareForReduction: PrepareAndOrExpectReductionFn;

    expectAfterTargetReduction: PrepareAndOrExpectReductionFn;

}

type ReducerProducerFn = (cageM: CageModel) => CageModelReducer;

type PerformanceTestPreparation = {

    readonly cageM: CageModel;

    readonly reduction: MasterModelReduction;

    readonly reducer: CageModelReducer;

};

describe('Performance tests for `CageModelOfSize2Reducer`', () => {

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
    };

    const createFullReducer = (cageM: CageModel) => {
        return new CageModelOfSize2Reducer(cageM);
    };

    const createPartialReducer = (cageM: CageModel) => {
        return new CageModelOfSize2PartialReducer(cageM);
    };

    const doRunFunctionalAndPerformanceTests = (
            config: ComparablePerformanceTestConfig,
            reducerProducer: ReducerProducerFn,
            type: string) => {
        // Checking that `CageModelReducer` works according to the functional expectations.
        runFunctionalTest(config, reducerProducer);

        const { cageM, reduction, reducer } = prepareForPerformanceTest(config, reducerProducer);

        let i = 0;

        //
        // Checking that the `CageModel` state stays intact
        // in between performance test iterations
        // to avoid impact on the reduction results that should be stable.
        //
        i = 0;
        const cageMCombosValue = cageM.comboSet.bitStore;
        const cellM1NumOptsValue = cageM.cellMs[0].numOptsSet().bitStore;
        const cellM2NumOptsValue = cageM.cellMs[1].numOptsSet().bitStore;
        while (i++ < 10) {
            reducer.reduce(reduction);
            expect(cageM.comboSet.bitStore).toBe(cageMCombosValue);
            expect(cageM.cellMs[0].numOptsSet().bitStore).toBe(cellM1NumOptsValue);
            expect(cageM.cellMs[1].numOptsSet().bitStore).toBe(cellM2NumOptsValue);
        }

        // Warming up by running sample iterations.
        i = 0;
        while (i++ < 100_000) {
            reducer.reduce(reduction);
        }

        // Actual performance test.
        const startTime = performance.now();
        i = 0;
        while (i++ < 1_000_000) {
            reducer.reduce(reduction);
        }

        log.info(`${type} reducer: ${Math.trunc(performance.now() - startTime)} ms`);
    };

    const runFunctionalTest = (config: ComparablePerformanceTestConfig, reducerProducer: ReducerProducerFn) => {
        const cageM = config.createReferenceCageModel();

        const reduction = new MasterModelReduction();
        config.prepareForReduction(cageM, reduction);
        reducerProducer(cageM).reduce(reduction);
        config.expectAfterTargetReduction(cageM, reduction);
    };

    const prepareForPerformanceTest = (config: ComparablePerformanceTestConfig, reducerProducer: ReducerProducerFn) => {
        const cageM = config.createReferenceCageModel();
        const reduction = new LockableMasterModelReduction();

        config.prepareForReduction(cageM, reduction);

        reduction.lock();
        cageM.lock();

        return { cageM, reducer: reducerProducer(cageM), reduction } as PerformanceTestPreparation;
    };

    test('Find solution for Sudoku.com puzzles', () => {
        // General warm up.
        CageModelOfSize2ReducerRouter.collectPerfStats = false;
        CachedNumRanges.ZERO_TO_N_LTE_81[3].forEach(() => {
            solveAllSudokuDotComPuzzles();
        });

        // Testing full reduction for `CageModel`s of size 2.
        CageModelOfSize2ReducerRouter.isAlwaysApplyFullReduction = true;

        // ... Warm up
        CageModelOfSize2ReducerRouter.collectPerfStats = false;
        solveAllSudokuDotComPuzzles();

        // ... Actual test
        log.info('Testing full reduction');
        CageModelOfSize2ReducerRouter.collectPerfStats = true;
        runAndMeasureAllSudokuDotComPuzzles('Full');
        const fullReductionStats = CageModelOfSize2ReducerRouter.captureMeasures();

        // Testing routing reduction for `CageModel`s of size 2.
        CageModelOfSize2ReducerRouter.isAlwaysApplyFullReduction = false;

        // ... Warm up
        CageModelOfSize2ReducerRouter.collectPerfStats = false;
        solveAllSudokuDotComPuzzles();

        // ... Actual test
        log.info('Testing routing reduction');
        CageModelOfSize2ReducerRouter.collectPerfStats = true;
        runAndMeasureAllSudokuDotComPuzzles('Routing');
        const routingReductionStats = CageModelOfSize2ReducerRouter.captureMeasures();

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
                // log.info('Full reduction wins:');
                // CageModelOfSize2ReducerRouter.printStat(fullReductionStat);
                // CageModelOfSize2ReducerRouter.printStat(routingReductionStat);
                ++fullReductionWins;
                if (fullReductionStat.deletedNumsCount === 1) {
                    ++fullReductionWinsWithDeletedLte1;
                    fullReductionWinsWithDeletedLte1SavedTime += durationDelta;
                }
            } else {
                // log.info('Partial reduction wins:');
                // CageModelOfSize2ReducerRouter.printStat(routingReductionStat);
                // CageModelOfSize2ReducerRouter.printStat(fullReductionStat);
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
