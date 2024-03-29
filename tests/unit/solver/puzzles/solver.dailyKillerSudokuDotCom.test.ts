import { Solver } from '../../../../src/solver/solver';
import { puzzleSamples } from '../../puzzle/puzzleSamples';

describe('Tests for solver applied to DailyKillerSudoku.com tasks', () => {
    const dailyKillerSudokuDotCom = puzzleSamples.dailyKillerSudokuDotCom;
    const solver = new Solver();

    test('Find solution for puzzle 24789 of difficulty 10 by DailyKillerSudoku.com', () => {
        const { numbers } = solver.solve(dailyKillerSudokuDotCom.puzzle24789_difficulty10);

        expect(numbers).toEqual([
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
        const { numbers } = solver.solve(dailyKillerSudokuDotCom.puzzle24889_difficulty10);

        expect(numbers).toEqual([
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

    test('Find solution for puzzle 24914 of difficulty 10 by DailyKillerSudoku.com', () => {
        const { numbers } = solver.solve(dailyKillerSudokuDotCom.puzzle24914_difficulty10);

        expect(numbers).toEqual([
            [ 7, 3, 5, 8, 1, 4, 2, 6, 9 ],
            [ 6, 1, 2, 9, 5, 3, 8, 4, 7 ],
            [ 4, 9, 8, 2, 7, 6, 1, 5, 3 ],
            [ 3, 4, 7, 6, 8, 9, 5, 2, 1 ],
            [ 1, 2, 9, 7, 4, 5, 3, 8, 6 ],
            [ 8, 5, 6, 3, 2, 1, 9, 7, 4 ],
            [ 5, 6, 1, 4, 9, 8, 7, 3, 2 ],
            [ 2, 8, 4, 1, 3, 7, 6, 9, 5 ],
            [ 9, 7, 3, 5, 6, 2, 4, 1, 8 ]
        ]);
    });

    test('Find solution for puzzle 24919 of difficulty 10 by DailyKillerSudoku.com', () => {
        const { numbers } = solver.solve(dailyKillerSudokuDotCom.puzzle24919_difficulty10);

        expect(numbers).toEqual([
            [ 1, 3, 2, 7, 5, 8, 6, 9, 4 ],
            [ 5, 8, 7, 4, 9, 6, 2, 3, 1 ],
            [ 9, 4, 6, 1, 3, 2, 8, 5, 7 ],
            [ 7, 5, 9, 2, 1, 3, 4, 6, 8 ],
            [ 4, 6, 1, 5, 8, 9, 3, 7, 2 ],
            [ 3, 2, 8, 6, 7, 4, 5, 1, 9 ],
            [ 6, 7, 4, 3, 2, 1, 9, 8, 5 ],
            [ 2, 9, 5, 8, 6, 7, 1, 4, 3 ],
            [ 8, 1, 3, 9, 4, 5, 7, 2, 6 ]
        ]);
    });
});
