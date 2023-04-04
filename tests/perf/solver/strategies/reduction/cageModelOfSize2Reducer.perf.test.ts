import { Solver } from '../../../../../src/solver/solver';
import { puzzleSamples } from '../../../../unit/puzzle/puzzleSamples';
import { logFactory } from '../../../../../src/util/logFactory';
import { Cell } from '../../../../../src/puzzle/cell';
import { Cage } from '../../../../../src/puzzle/cage';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { CageModelOfSize2PartialReducer } from '../../../../../src/solver/strategies/reduction/cageModelOfSize2PartialReducer';
import { CageModelOfSize2ReducerRouter } from '../../../../../src/solver/strategies/reduction/cageModelOfSize2ReducerRouter';
import { CachedNumRanges } from '../../../../../src/util/cachedNumRanges';

const log = logFactory.withLabel('solver.perf');

describe('Performance tests for `CageModelOfSize2Reducer`', () => {

    const sudokuDotCom = puzzleSamples.sudokuDotCom;
    const solver = new Solver();

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

    test('Does not reduce if all number options for a particular `Combo` are deleted', () => {
        let i = 0;
        while (i++ < 100_000) {
            // Given:
            const cell1 = Cell.at(3, 7);
            const cell2 = Cell.at(3, 8);
            const cage = Cage.ofSum(9).withCell(cell1).withCell(cell2).new();

            const cellM1 = new CellModel(cell1);
            const cellM2 = new CellModel(cell2);
            const cageM = new CageModel(cage, [ cellM1, cellM2 ]);

            cellM1.addWithinCageModel(cageM);
            cellM2.addWithinCageModel(cageM);

            cageM.initialReduce();

            // 2, 7, 4, 5
            cellM1.deleteNumOpt(1); cellM1.deleteNumOpt(3); cellM1.deleteNumOpt(6); cellM1.deleteNumOpt(8);
            cellM1.deleteNumOpt(1); cellM2.deleteNumOpt(3); cellM2.deleteNumOpt(6); cellM1.deleteNumOpt(8);

            const reduction = new MasterModelReduction();

            reduction.deleteNumOpt(cellM1, 2); reduction.deleteNumOpt(cellM1, 5); reduction.deleteNumOpt(cellM1, 7);
            reduction.deleteNumOpt(cellM2, 2); reduction.deleteNumOpt(cellM2, 7);

            cageM.reduceToCombinationsContaining(4, reduction);

            // When:
            const reducer = new CageModelOfSize2PartialReducer(cageM);
            reducer.reduce(reduction);

            // // Then:
            // expect(cellM1.numOpts()).toEqual([ 4 ]);
            // expect(cellM2.numOpts()).toEqual([ 5 ]);
            // expect(Array.from(cageM.comboSet.combos)).toEqual([
            //     Combo.of(4, 5)
            // ]);
        }
    });

    test.skip('Find solution for Sudoku.com puzzles', () => {
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

});
