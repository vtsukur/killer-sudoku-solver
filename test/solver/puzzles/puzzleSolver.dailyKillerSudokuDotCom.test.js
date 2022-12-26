import _ from 'lodash';
import { PuzzleSolver } from '../../../src/solver/puzzleSolver';
import { dailyKillerSudokuDotCom_puzzle24789_difficulty10, dailyKillerSudokuDotCom_puzzle24889_difficulty10 } from '../../problem/realProblemSamples';

describe('Tests for PuzzleSolver applied to DailyKillerSudoku.com tasks', () => {
    test('Find solution for puzzle 24789 of difficulty 10 by DailyKillerSudoku.com', () => {
        const solver = new PuzzleSolver(dailyKillerSudokuDotCom_puzzle24789_difficulty10);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 5, 1, 3, 9, 2, 8, 4, 7, 6 ],
            [ 2, 4, 8, 3, 7, 6, 1, 9, 5 ],
            [ 6, 7, 9, 4, 5, 1, 8, 2, 3 ],
            [ 9, 6, 7, 2, 8, 4, 5, 3, 1 ],
            [ 3, 8, 1, 5, 9, 7, 6, 4, 2 ],
            [ 4, 2, 5, 6, 1, 3, 7, 8, 9 ],
            [ 1, 9, 6, 7, 4, 2, 3, 5, 8 ],
            [ 7, 3, 2, 8, 6, 5, 9, 1, 4 ],
            [ 8, 5, 4, 1, 3, 9, 2, 6, 7 ]
        ]);
    });

    test('Find solution for puzzle 24889 of difficulty 10 by DailyKillerSudoku.com', () => {
        const solver = new PuzzleSolver(dailyKillerSudokuDotCom_puzzle24889_difficulty10);
        const solution = solver.solve();

        expect(solution).toEqual([
            [ 7, 6, 8, 2, 3, 9, 1, 5, 4 ],
            [ 4, 2, 5, 6, 8, 1, 3, 7, 9 ],
            [ 9, 1, 3, 5, 7, 4, 8, 6, 2 ],
            [ 8, 9, 1, 3, 5, 2, 7, 4, 6 ],
            [ 2, 5, 6, 4, 1, 7, 9, 3, 8 ],
            [ 3, 7, 4, 8, 9, 6, 5, 2, 1 ],
            [ 1, 4, 9, 7, 2, 3, 6, 8, 5 ],
            [ 5, 3, 2, 1, 6, 8, 4, 9, 7 ],
            [ 6, 8, 7, 9, 4, 5, 2, 1, 3 ]
        ]);
    });
});
