import * as _ from 'lodash';
import { Solver } from '../../../../src/solver/solver';
import { puzzleSamples } from '../../puzzle/puzzleSamples';

describe('Performance tests for Solver', () => {
    const sudokuDotCom = puzzleSamples.sudokuDotCom;
    const dailyKillerSudokuDotCom = puzzleSamples.dailyKillerSudokuDotCom;
    const solver = new Solver();

    test.skip('Find solution for Daily Challenge (2022-04-06) by Sudoku.com', () => {
        _.range(10).forEach(() => {
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
            solver.solve(dailyKillerSudokuDotCom.puzzle24789_difficulty10);
            solver.solve(dailyKillerSudokuDotCom.puzzle24889_difficulty10);
            solver.solve(dailyKillerSudokuDotCom.puzzle24914_difficulty10);
            solver.solve(dailyKillerSudokuDotCom.puzzle24919_difficulty10);
        });
    });
});
