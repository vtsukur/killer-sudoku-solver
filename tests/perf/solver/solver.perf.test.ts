import * as _ from 'lodash';
import { Solver } from '../../../src/solver/solver';
import { puzzleSamples } from '../../unit/puzzle/puzzleSamples';
import { CachedNumRanges } from '../../../src/util/cachedNumRanges';
import { CageModelOfSize2ReducerRouter } from '../../../src/solver/strategies/reduction/cageModelOfSize2ReducerRouter';
import { logFactory } from '../../../src/util/logFactory';

const log = logFactory.withLabel('solver.perf');

describe('Performance tests for `Solver`', () => {

    const sudokuDotCom = puzzleSamples.sudokuDotCom;
    const dailyKillerSudokuDotCom = puzzleSamples.dailyKillerSudokuDotCom;
    const solver = new Solver();

    const ITERATIONS = _.range(10);

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

    test.skip('Find solution for Sudoku.com puzzles', () => {
        ITERATIONS.forEach(() => {
            solveAllSudokuDotComPuzzles();
        });
    });

    test('Find solution for Sudoku.com puzzles (targeting `CageModel` of size 2 reduction)', () => {
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
        solveAllSudokuDotComPuzzles();
        const fullReductionStats = CageModelOfSize2ReducerRouter.captureMeasures();

        // Testing routing reduction for `CageModel`s of size 2.
        CageModelOfSize2ReducerRouter.isAlwaysApplyFullReduction = false;

        // ... Warm up
        CageModelOfSize2ReducerRouter.collectPerfStats = false;
        solveAllSudokuDotComPuzzles();

        // ... Actual test
        log.info('Testing routing reduction');
        CageModelOfSize2ReducerRouter.collectPerfStats = true;
        solveAllSudokuDotComPuzzles();
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
                log.info('Full reduction wins:');
                CageModelOfSize2ReducerRouter.printStat(fullReductionStat);
                CageModelOfSize2ReducerRouter.printStat(routingReductionStat);
                ++fullReductionWins;
                if (fullReductionStat.deletedNumsCount === 1) {
                    ++fullReductionWinsWithDeletedLte1;
                    fullReductionWinsWithDeletedLte1SavedTime += durationDelta;
                }
            } else {
                log.info('Partial reduction wins:');
                CageModelOfSize2ReducerRouter.printStat(routingReductionStat);
                CageModelOfSize2ReducerRouter.printStat(fullReductionStat);
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

    test.skip('Find solution for DailyKillerSudoku.com puzzles', () => {
        ITERATIONS.forEach(() => {
            solver.solve(dailyKillerSudokuDotCom.puzzle24789_difficulty10);
            solver.solve(dailyKillerSudokuDotCom.puzzle24889_difficulty10);
            solver.solve(dailyKillerSudokuDotCom.puzzle24914_difficulty10);
            solver.solve(dailyKillerSudokuDotCom.puzzle24919_difficulty10);
        });
    });

});
