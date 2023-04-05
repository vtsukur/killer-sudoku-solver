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
import { ReadonlySudokuNumsSet, SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModelOfSize2Reducer } from '../../../../../src/solver/strategies/reduction/cageModelOfSize2Reducer';
import { performance } from 'perf_hooks';
import { Combo } from '../../../../../src/solver/math';
import { CageModelReducer } from '../../../../../src/solver/strategies/reduction/cageModelReducer';

const log = logFactory.withLabel('cageModelOfSize2Reducer.perf');

class LockableCellModel extends CellModel {

    isLocked = false;

    private static readonly _EMPTY_NUMS_SET = SudokuNumsSet.newEmpty();

    constructor(cell: Cell) {
        super(cell);
    }

    deleteNumOpt(val: number) {
        if (!this.isLocked) {
            return super.deleteNumOpt(val);
        } else {
            return LockableCellModel._EMPTY_NUMS_SET;
        }
    }

    reduceNumOpts(val: ReadonlySudokuNumsSet): ReadonlySudokuNumsSet {
        if (!this.isLocked) {
            return super.reduceNumOpts(val);
        } else {
            return LockableCellModel._EMPTY_NUMS_SET;
        }
    }

}

describe('Performance tests for `CageModelOfSize2Reducer`', () => {

    const sudokuDotCom = puzzleSamples.sudokuDotCom;
    const solver = new Solver();

    test('Comparable test for 1 `Combo`, 3 present numbers and 5 deleted numbers', () => {
        runComparablePerformanceTest(9,
            (cageM) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 4, 5, 7));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 4, 5, 7));
            },
            (cageM, reduction) => {
                reduction.tryReduceNumOpts(cageM.cellMs[0], SudokuNumsSet.of(4));
                reduction.tryReduceNumOpts(cageM.cellMs[1], SudokuNumsSet.of(4, 5));
                cageM.reduceToCombinationsContaining(4, reduction);
            },
            (cageM) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 5 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(4, 5)
                ]);
            },
            (cageM) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 5 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(4, 5)
                ]);
            });
    });

    const runComparablePerformanceTest = (
            sum: number,
            beforePrepReductionFn: (cageM: CageModel) => void,
            prepReductionFn: (cageM: CageModel, reduction: MasterModelReduction) => void,
            expectAfterPrepReductionFn: (cageM: CageModel) => void,
            expectAfterTargetPerfReductionFn: (cageM: CageModel) => void) => {
        const cell1 = Cell.at(3, 7);
        const cell2 = Cell.at(3, 8);
        const cage = Cage.ofSum(sum).withCell(cell1).withCell(cell2).new();

        const cellM1 = new LockableCellModel(cell1);
        const cellM2 = new LockableCellModel(cell2);
        const cageM = new CageModel(cage, [ cellM1, cellM2 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);

        cageM.initialReduce();

        beforePrepReductionFn(cageM);

        const reduction = new MasterModelReduction();

        prepReductionFn(cageM, reduction);

        cellM1.isLocked = true;
        cellM2.isLocked = true;

        expectAfterPrepReductionFn(cageM);

        doVerifyAndRunForFullReducer(cageM, reduction, expectAfterTargetPerfReductionFn);
        doVerifyAndRunForPartialReducer(cageM, reduction, expectAfterTargetPerfReductionFn);
    };

    const doVerifyAndRunForFullReducer = (
            cageM: CageModel,
            reduction: MasterModelReduction,
            expectFn: (cageM: CageModel) => void) => {
        const cageMCopy = createCageMCopy(cageM);
        new CageModelOfSize2Reducer(cageMCopy).reduce(reduction);
        expectFn(cageMCopy);

        doRunForReducer(reduction, new CageModelOfSize2Reducer(cageM), 'Full');
    };

    const doVerifyAndRunForPartialReducer = (
            cageM: CageModel,
            reduction: MasterModelReduction,
            expectFn: (cageM: CageModel) => void) => {
        const cageMCopy = createCageMCopy(cageM);
        new CageModelOfSize2PartialReducer(cageMCopy).reduce(reduction);
        expectFn(cageMCopy);

        doRunForReducer(reduction, new CageModelOfSize2PartialReducer(cageM), 'Partial');
    };

    const createCageMCopy = (cageM: CageModel) => {
        const cageMCopy = cageM.deepCopyWithSameCellModels();

        const cellM1Copy = cageM.cellMs[0].deepCopyWithoutCageModels();
        const cellM2Copy = cageM.cellMs[1].deepCopyWithoutCageModels();

        cellM1Copy.addWithinCageModel(cageMCopy);
        cellM2Copy.addWithinCageModel(cageMCopy);

        cageMCopy.cellMs[0] = cellM1Copy;
        cageMCopy.cellMs[1] = cellM2Copy;

        return cageMCopy;
    };

    const doRunForReducer = (
            reduction: MasterModelReduction,
            reducer: CageModelReducer,
            type: string) => {
        let i = 0;

        // Warming up.
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
